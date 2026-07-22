import express, { Request, Response } from "express";
import Order from "../models/Order";

const router = express.Router();

// 📥 GET /api/orders — Fetch all orders
router.get("/", async (req: Request, res: Response) => {
    try {
        const orders = await Order.find().populate("items.product").sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Failed to fetch orders" });
    }
});

// 🔄 PATCH /api/orders/:id/status — Update order status
router.patch("/:id/status", async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.status(200).json({ success: true, order: updatedOrder });
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Failed to update order status" });
    }
});

export default router;