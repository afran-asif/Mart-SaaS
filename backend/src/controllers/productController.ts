import { Response } from "express";
import { Product } from "../models/Product";
import { Store } from "../models/Store";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const createProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try{
        const { name, price, description, images, stock } = req.body;
        const vendorId = req.user._id;

        const store = await Store.findOne({ vendorId });
        if(!store) {
            res.status(400).json({ message: "Store not found. You must have a store to add products."})
            return;
        }
        const newProduct = new Product({
            vendorId,
            storeId: store._id,
            name,
            price,
            description,
            images,
            stock
        });

        const savedProduct = await newProduct.save();

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: savedProduct
        });
    } catch(error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getVendorProducts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try{
        const vendorId = req.user._id;

        const products = await Product.find({ vendorId });

        res.status(200).json({
            success: true,
            count: products.length,
            products
        })
    } catch(error) {
        res.status(500).json({ message: (error as Error).message });
    }
}

export const updateProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try{
        const { id } = req.params;
        const vendorId = req.user._id;

        let product = await Product.findOne({ _id: id, vendorId });

        if (!product) {
            res.status(404).json({ message: "Product not found or unauthorized" })
            return;
        }
        const updateProduct = await Product.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updateProduct
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
}

export const deleteProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try{
        const { id } = req.params;
        const vendorId = req.user._id;

        const product = await Product.findOne({ _id: id, vendorId })

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
}
