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