// src/controllers/productController.ts
import { Response } from "express";
import { Product } from "../models/Product";
import { Store } from "../models/Store";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { TenantRequest } from "../middlewares/tenantMiddleware";

// 📤 ১. নতুন প্রোডাক্ট তৈরি করা (Multer ফাইল সাপোর্টসহ)
export const createProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        // FormData থেকে পাঠানো ফিল্ডগুলো রিসিভ করা হচ্ছে
        const { name, price, description, stock } = req.body;
        const vendorId = req.user._id;

        // ভেন্ডরের স্টোর খুঁজে বের করা
        const store = await Store.findOne({ vendorId });
        if (!store) {
            res.status(400).json({ message: "Store not found. You must have a store to add products." });
            return;
        }

        // 🖼️ ইমেজ ফাইল প্রসেসিং
        let productImages: string[] = [];
        
        // যদি ফ্রন্টএন্ড ড্র্যাগ-অ্যান্ড-ড্রপ থেকে ফাইল আপলোড করা হয়
        if (req.file) {
            // লোকাল ইউআরএল জেনারেট করা হচ্ছে (যেমন: http://localhost:5000/uploads/1712345678.png)
            const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
            productImages.push(imageUrl);
        }

        const newProduct = new Product({
            vendorId,
            storeId: store._id,
            name,
            price: Number(price),       // FormData ডেটা স্ট্রিং হিসেবে পাঠায়, তাই নাম্বারে কাস্ট করা হলো
            description,
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

        const products = await Product.find({ vendorId });

        res.status(200).json({
            success: true,
            count: products.length,
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
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: req.body },
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

        const product = await Product.findOne({ _id: id, vendorId });

        if (!product) {
            res.status(404).json({ message: "Product not found or unauthorized" });
            return;
        }

        await product.deleteOne();

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
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