// src/controllers/productController.ts
import { Response } from "express";
import mongoose from "mongoose";
import { Product } from "../models/Product";
import { Store } from "../models/Store";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { TenantRequest } from "../middlewares/tenantMiddleware";
import { uploadToCloudinary } from "../middlewares/uploadMiddleware";
import { checkProductLimit, getEffectivePlan } from "../utils/plan";

// 📤 ১. নতুন প্রোডাক্ট তৈরি করা (Multer ফাইল সাপোর্টসহ)
// FormData থেকে sizes বের করা — JSON string অথবা comma-repeated
const normalizeSizes = (raw: unknown): string[] => {
    if (raw === undefined || raw === null || raw === "") return [];
    let arr: unknown[] = typeof raw === "string" ? raw.split(",") : Array.isArray(raw) ? raw : [];
    if (typeof raw === "string") {
        const trimmed = raw.trim();
        if (trimmed.startsWith("[")) {
            try {
                const parsed = JSON.parse(trimmed);
                arr = Array.isArray(parsed) ? parsed : [];
            } catch {
                arr = [];
            }
        }
    }
    return arr
        .map((s) => String(s).trim())
        .filter((s) => s.length > 0)
        .slice(0, 15);
};

export const createProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        // FormData থেকে পাঠানো ফিল্ডগুলো রিসিভ করা হচ্ছে
        const { name, price, description, category, stock, featured } = req.body;
        const sizes = normalizeSizes(req.body.sizes);
        const vendorId = req.user._id;

        // ভেন্ডরের স্টোর খুঁজে বের করা
        const store = await Store.findOne({ vendorId });
        if (!store) {
            res.status(400).json({ message: "Store not found. You must have a store to add products." });
            return;
        }

        // 📦 Plan limit — free plan-এ ২০টা পর্যন্ত
        const limitMsg = await checkProductLimit(store);
        if (limitMsg) {
            res.status(403).json({ message: limitMsg, proRequired: true });
            return;
        }

        // 🖼️ Multi-Image File Processing (max 5 images)
        let productImages: string[] = [];

        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            // প্রতিটি ফাইল Cloudinary-তে প্যারালেলে আপলোড করা হচ্ছে
            const uploadPromises = (req.files as Express.Multer.File[]).map((file) =>
                uploadToCloudinary(file.path, "vendoo-products", [{ width: 900, crop: "limit", quality: "auto", fetch_format: "auto" }])
            );
            productImages = await Promise.all(uploadPromises);
        }

        const newProduct = new Product({
            vendorId,
            storeId: store._id,
            name,
            price: Number(price),       // FormData ডেটা স্ট্রিং হিসেবে পাঠায়, তাই নাম্বারে কাস্ট করা হলো
            description,
            category,
            images: productImages,      // লোকাল ইমেজের ইউআরএল অ্যারেতে সেট হলো
            stock: Number(stock),        // নাম্বারে কাস্ট করা হলো
            featured: featured === "true" || featured === true,
            sizes,
        });

        const savedProduct = await newProduct.save();

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: savedProduct
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};



// 🔍 ২. ভেন্ডরের নিজস্ব সব প্রোডাক্ট গেট করা
export const getVendorProducts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const vendorId = req.user._id;
        
        // 📥 Query параметры রিসিভ করা
        const { search, category, page = 1, limit = 10 } = req.query;

        // 🎯 বেসিক ফিল্টার অবজেক্ট
        const filterQuery: any = { vendorId };

        // 🔍 Search লজিক (Case-insensitive)
        if (search) {
            filterQuery.name = { $regex: search as string, $options: "i" };
        }

        // 🏷️ Category Filter লজিক
        if (category && category !== "General" && category !== "All") {
            filterQuery.category = category;
        }

        // 📄 Pagination গণনা
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;

        // 📊 ক্যোয়ারি রান করা
        const products = await Product.find(filterQuery)
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 });

        const totalProducts = await Product.countDocuments(filterQuery);

        res.status(200).json({
            success: true,
            count: products.length,
            totalProducts,
            totalPages: Math.ceil(totalProducts / limitNum),
            currentPage: pageNum,
            products
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};



// 📝 ৩. প্রোডাক্ট আপডেট করা
export const updateProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const vendorId = req.user._id;

        let product = await Product.findOne({ _id: id, vendorId });

        if (!product) {
            res.status(404).json({ message: "Product not found or unauthorized" });
            return;
        }

        const { name, price, description, category, stock, featured, existingImages } = req.body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (price !== undefined) updateData.price = Number(price);
        if (stock !== undefined) updateData.stock = Number(stock);
        if (category !== undefined) updateData.category = category;
        if (description !== undefined) updateData.description = description;
        if (featured !== undefined) updateData.featured = featured === "true" || featured === true;
        if (req.body.sizes !== undefined) updateData.sizes = normalizeSizes(req.body.sizes);

        // Image Handling
        let finalImages: string[] = [];

        // Parse existingImages if sent via FormData or JSON
        if (existingImages !== undefined) {
            if (Array.isArray(existingImages)) {
                finalImages = existingImages;
            } else if (typeof existingImages === "string") {
                try {
                    finalImages = JSON.parse(existingImages);
                } catch {
                    finalImages = [existingImages];
                }
            }
        } else if (!req.files || (req.files as any[]).length === 0) {
            // If neither existingImages nor req.files were provided in request, keep existing product images
            finalImages = product.images || [];
        }

        // Upload new files to Cloudinary if provided
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const uploadPromises = (req.files as Express.Multer.File[]).map((file) =>
                uploadToCloudinary(file.path, "vendoo-products", [{ width: 900, crop: "limit", quality: "auto", fetch_format: "auto" }])
            );
            const newUploadedImages = await Promise.all(uploadPromises);
            finalImages = [...finalImages, ...newUploadedImages];
        }

        // Set final images array (limit to max 5)
        updateData.images = finalImages.slice(0, 5);

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};



export const toggleFeatured = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const vendorId = req.user._id;
        const product = await Product.findOne({ _id: id, vendorId });
        if (!product) {
            res.status(404).json({ message: "Product not found or unauthorized" });
            return;
        }
        // ⭐ Free plan-এ সর্বোচ্চ ৩টা featured (Pro-তে unlimited)
        if (!product.featured) {
            const store = await Store.findOne({ vendorId }).select("plan planExpiresAt");
            if (store && getEffectivePlan(store) !== "pro") {
                const featuredCount = await Product.countDocuments({ storeId: product.storeId, featured: true });
                if (featuredCount >= 3) {
                    res.status(403).json({ message: "Free plan allows up to 3 featured products. Upgrade to Pro for unlimited Best Picks.", proRequired: true });
                    return;
                }
            }
        }
        product.featured = !product.featured;
        await product.save();
        res.status(200).json({ success: true, message: product.featured ? "Added to featured" : "Removed from featured", product });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// 🗑️ ৪. প্রোডাক্ট ডিলিট করা
export const deleteProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const vendorId = req.user._id;

        // চেক করা হচ্ছে প্রোডাক্টটি এই ভেন্ডরের কি না এবং একই সাথে ডিলিট করা হচ্ছে
        const product = await Product.findOneAndDelete({ _id: id, vendorId });

        if (!product) {
            res.status(404).json({ success: false, message: "Product not found or unauthorized" });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};



// 🌐 ৫. টেন্যান্ট বা সাবডোমেইনের জন্য প্রোডাক্ট গেট করা
export const getTenantProducts = async (req: TenantRequest, res: Response): Promise<void> => {
    try {
        const storeId = req.storeId;

        const filter: Record<string, unknown> = { storeId };
        // optional filters — ?category= & ?featured=true
        if (req.query.category) {
            const esc = (req.query.category as string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.category = { $regex: new RegExp(`^${esc}$`, "i") };
        }
        if (req.query.featured === "true") {
            filter.featured = true;
        }
        // 🔎 search — product name-তে (case-insensitive, escaped)
        if (req.query.search) {
            const esc = (req.query.search as string).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            if (esc) filter.name = { $regex: esc, $options: "i" };
        }

        // pagination — কোনো param না দিলে সব (sitemap/backward-compat)
        const hasPage = !!(req.query.page || req.query.limit);
        if (
            !hasPage &&
            !req.query.category &&
            req.query.featured !== "true" &&
            req.query.sort !== "random" &&
            !req.query.search
        ) {
            const products = await Product.find({ storeId }).sort({ createdAt: -1 });
            res.status(200).json({ success: true, count: products.length, products });
            return;
        }

        // 🎲 random picks (storefront home) — $sample
        // NOTE: aggregation-এ auto-cast হয় না, storeId ObjectId-তে convert must
        if (req.query.sort === "random") {
            const size = Math.min(24, Math.max(1, parseInt(req.query.limit as string) || 12));
            const matchStage: Record<string, unknown> = {
                storeId: new mongoose.Types.ObjectId(storeId as string),
            };
            if (filter.category) matchStage.category = filter.category;
            if (filter.name) matchStage.name = filter.name;
            const [total, products] = await Promise.all([
                Product.countDocuments(filter),
                Product.aggregate([{ $match: matchStage }, { $sample: { size } }]),
            ]);
            res.status(200).json({ success: true, count: products.length, total, products });
            return;
        }

        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || (hasPage ? 24 : 100)));
        const [total, products] = await Promise.all([
            Product.countDocuments(filter),
            Product.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
        ]);
        res.status(200).json({
            success: true,
            count: products.length,
            total,
            page,
            pages: Math.max(1, Math.ceil(total / limit)),
            products,
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};


export const getTenantProductById = async (req: TenantRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const storeId = req.storeId;

        const product = await Product.findOne({ _id: id, storeId });

        if (!product) {
            res.status(404).json({ message: "Product not found in this store" });
            return;
        }

        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};