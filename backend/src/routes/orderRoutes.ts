import express, { Response } from "express";
import Order from "../models/Order";
import { Store } from "../models/Store";
import { protect, AuthenticatedRequest } from "../middlewares/authMiddleware";

const router = express.Router();

// Helper — vendor এর storeId বের করা
const getVendorStoreId = async (vendorId: string): Promise<string | null> => {
    const store = await Store.findOne({ vendorId });
    return store ? store._id.toString() : null;
};

// 📥 GET /api/v1/orders — Fetch only this vendor's orders
router.get("/", protect, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const storeId = await getVendorStoreId(req.user._id.toString());

        if (!storeId) {
            res.status(404).json({ message: "Store not found for this vendor." });
            return;
        }

        const orders = await Order.find({ storeId })
            .populate("items.product", "name price images")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, orders });
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Failed to fetch orders" });
    }
});

// ➕ POST /api/v1/orders — Create a new order (customer places order)
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const {
            customerName,
            customerEmail,
            shippingAddress,
            phone,
            totalAmount,
            items,
            storeId,   // frontend থেকে পাঠাতে হবে (কোন store এ order হচ্ছে)
        } = req.body;

        if (!customerName || !customerEmail || !shippingAddress || !totalAmount || !items?.length || !storeId) {
            res.status(400).json({ message: "Please provide all required order fields including storeId." });
            return;
        }

        // storeId থেকে vendorId বের করা
        const store = await Store.findById(storeId);
        if (!store) {
            res.status(404).json({ message: "Store not found." });
            return;
        }

        const newOrder = await Order.create({
            vendorId: store.vendorId,
            storeId,
            customerName,
            customerEmail,
            shippingAddress,
            phone,
            totalAmount,
            items,
            status: "Pending",
        });

        res.status(201).json({ success: true, order: newOrder });
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Failed to create order" });
    }
});

// 🔄 PATCH /api/v1/orders/:id/status — Update order status (vendor only)
router.patch("/:id/status", protect, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { status } = req.body;

        const storeId = await getVendorStoreId(req.user._id.toString());

        // নিশ্চিত করা — এই order এই vendor এর
        const order = await Order.findOne({ _id: req.params.id, storeId });
        if (!order) {
            res.status(404).json({ message: "Order not found or not authorized." });
            return;
        }

        order.status = status;
        await order.save();

        res.status(200).json({ success: true, order });
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Failed to update order status" });
    }
});

export default router;