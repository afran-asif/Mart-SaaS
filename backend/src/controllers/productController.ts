// src/controllers/productController.ts
import { Response } from "express";
import { Product } from "../models/Product";
import { Store } from "../models/Store";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { TenantRequest } from "../middlewares/tenantMiddleware";
import { uploadToCloudinary } from "../middlewares/uploadMiddleware";

// 📤 ১. নতুন প্রোডাক্ট তৈরি করা (Multer ফাইল সাপোর্টসহ)
export const createProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        // FormData থেকে পাঠানো ফিল্ডগুলো রিসিভ করা হচ্ছে
        const { name, price, description, category, stock } = req.body;
        const vendorId = req.user._id;

        // ভেন্ডরের স্টোর খুঁজে বের করা
        const store = await Store.findOne({ vendorId });
        if (!store) {
            res.status(400).json({ message: "Store not found. You must have a store to add products." });
            return;
        }

        // 🖼️ Multi-Image File Processing (max 5 images)
        let productImages: string[] = [];

        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            // প্রতিটি ফাইল Cloudinary-তে প্যারালেলে আপলোড করা হচ্ছে
            const uploadPromises = (req.files as Express.Multer.File[]).map((file) =>
                uploadToCloudinary(file.path)
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
            stock: Number(stock)        // নাম্বারে কাস্ট করা হলো
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

        const { name, price, description, category, stock, existingImages } = req.body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (price !== undefined) updateData.price = Number(price);
        if (stock !== undefined) updateData.stock = Number(stock);
        if (category !== undefined) updateData.category = category;
        if (description !== undefined) updateData.description = description;

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
                uploadToCloudinary(file.path)
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

        const products = await Product.find({ storeId });

        res.status(200).json({
            success: true,
            count: products.length,
            products
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