import { Response } from "express";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { Store } from "../models/Store";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

const escRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// 🏷️ সব ক্যাটাগরি (product count সহ) — legacy product categories automatically adopt হয়
export const getCategories = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const vendorId = req.user._id;

        const store = await Store.findOne({ vendorId });
        if (!store) {
            res.status(400).json({ message: "Store not found." });
            return;
        }

        // পুরনো products এর category থেকে distinct নাম বের করা (adopt করার জন্য)
        const rawProductCategories = await Product.distinct("category", { vendorId });
        const legacyNames = (rawProductCategories as string[])
            .map((c) => (c || "").trim())
            .filter((c) => c && c !== "General");

        const existing = await Category.find({ vendorId }).select("name");
        const existingNames = new Set(existing.map((c) => c.name.trim().toLowerCase()));

        // যেসব নাম এখনো Category collection-এ নেই, সেগুলো adopt করে ডক তৈরি করা
        const toAdopt = legacyNames.filter((n) => !existingNames.has(n.toLowerCase()));
        if (toAdopt.length > 0) {
            const insertDocs = [...new Set(toAdopt.map((n) => n.toLowerCase()))]
                .map((n) => legacyNames.find((x) => x.toLowerCase() === n)!)
                .map((name) => ({ vendorId, storeId: store._id, name }));
            await Category.insertMany(insertDocs);
        }

        const categories = await Category.find({ vendorId }).sort({ name: 1 });

        // প্রতিটি category এর product count বের করা (case-insensitive)
        const categoriesWithCount = await Promise.all(
            categories.map(async (c) => ({
                _id: c._id,
                name: c.name,
                createdAt: c.createdAt,
                productCount: await Product.countDocuments({
                    vendorId,
                    category: { $regex: new RegExp(`^${escRegex(c.name)}$`, "i") },
                }),
            }))
        );

        res.status(200).json({ success: true, categories: categoriesWithCount });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// ➕ নতুন category তৈরি
export const createCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const vendorId = req.user._id;
        const { name } = req.body;

        const cleanName = (name || "").toString().trim();
        if (!cleanName) {
            res.status(400).json({ message: "Category name is required." });
            return;
        }
        if (cleanName.toLowerCase() === "general" || cleanName.toLowerCase() === "all") {
            res.status(400).json({ message: "\"General\" and \"All\" are reserved names." });
            return;
        }

        const store = await Store.findOne({ vendorId });
        if (!store) {
            res.status(400).json({ message: "Store not found." });
            return;
        }

        const existing = await Category.findOne({
            vendorId,
            name: { $regex: new RegExp(`^${escRegex(cleanName)}$`, "i") },
        });
        if (existing) {
            res.status(400).json({ message: "Category already exists." });
            return;
        }

        const category = await Category.create({ vendorId, storeId: store._id, name: cleanName });

        res.status(201).json({ success: true, message: "Category created successfully", category });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// ✏️ Category rename — products এর category ও আপডেট হয়
export const updateCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const vendorId = req.user._id;
        const { name } = req.body;

        const category = await Category.findOne({ _id: id, vendorId });
        if (!category) {
            res.status(404).json({ message: "Category not found." });
            return;
        }

        const cleanName = (name || "").toString().trim();
        if (!cleanName) {
            res.status(400).json({ message: "Category name is required." });
            return;
        }
        if (cleanName.toLowerCase() === "general" || cleanName.toLowerCase() === "all") {
            res.status(400).json({ message: "\"General\" and \"All\" are reserved names." });
            return;
        }

        // অন্য ক্যাটাগরির সাথে নামের clash check (case-insensitive)
        const clash = await Category.findOne({
            vendorId,
            _id: { $ne: id },
            name: { $regex: new RegExp(`^${escRegex(cleanName)}$`, "i") },
        });
        if (clash) {
            res.status(400).json({ message: "Category already exists." });
            return;
        }

        const oldName = category.name;
        category.name = cleanName;
        await category.save();

        // ঐ নামের products গুলো নতুন নামে আপডেট করা
        await Product.updateMany(
            { vendorId, category: { $regex: new RegExp(`^${escRegex(oldName)}$`, "i") } },
            { $set: { category: cleanName } }
        );

        res.status(200).json({ success: true, message: "Category updated successfully", category });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// 🗑️ Category delete — ঐ category এর products "General" হয়ে যায়
export const deleteCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const vendorId = req.user._id;

        const category = await Category.findOneAndDelete({ _id: id, vendorId });
        if (!category) {
            res.status(404).json({ message: "Category not found." });
            return;
        }

        const result = await Product.updateMany(
            { vendorId, category: { $regex: new RegExp(`^${escRegex(category.name)}$`, "i") } },
            { $set: { category: "General" } }
        );

        res.status(200).json({
            success: true,
            message: "Category deleted successfully",
            movedProducts: result.modifiedCount,
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};