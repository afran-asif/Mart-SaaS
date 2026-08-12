import { Response } from "express";
import mongoose from "mongoose";
import Order from "../models/Order";
import { Store } from "../models/Store";
import { Product } from "../models/Product";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

// Helper — vendor এর storeId বের করা
const getVendorStoreId = async (vendorId: string): Promise<string | null> => {
    const store = await Store.findOne({ vendorId });
    return store ? store._id.toString() : null;
};

const validTransitions: Record<string, string[]> = {
    Pending: ["Processing", "Cancelled"],
    Processing: ["Delivered", "Cancelled"],
    Delivered: [],   // terminal — কোথাও যেতে পারবে না
    Cancelled: [],   // terminal — কোথাও যেতে পারবে না
};
// 📥 Fetch only this vendor's orders
export const getVendorOrders = async (req: AuthenticatedRequest, res: Response) => {
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
};

// ➕ Create a new order (customer places order) — with atomic stock deduction
export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            customerName,
            customerEmail,
            shippingAddress,
            phone,
            totalAmount,
            items,
            storeId,
        } = req.body;

        if (!customerName || !customerEmail || !shippingAddress || !totalAmount || !items?.length || !storeId) {
            await session.abortTransaction();
            res.status(400).json({ message: "Please provide all required order fields including storeId." });
            return;
        }

        const store = await Store.findById(storeId).session(session);
        if (!store) {
            await session.abortTransaction();
            res.status(404).json({ message: "Store not found." });
            return;
        }

        // প্রতিটা item এর জন্য stock atomically চেক করে কমানো
        for (const item of items) {
            const updatedProduct = await Product.findOneAndUpdate(
                { _id: item.product, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { new: true, session }
            );

            if (!updatedProduct) {
                await session.abortTransaction();
                res.status(400).json({
                    message: `Insufficient stock for one of the products in your order.`,
                });
                return;
            }
        }

        const newOrder = await Order.create(
            [
                {
                    vendorId: store.vendorId,
                    storeId,
                    customerName,
                    customerEmail,
                    shippingAddress,
                    phone,
                    totalAmount,
                    items,
                    status: "Pending",
                },
            ],
            { session }
        );

        await session.commitTransaction();
        res.status(201).json({ success: true, order: newOrder[0] });
    } catch (error: any) {
        await session.abortTransaction();
        res.status(500).json({ message: error.message || "Failed to create order" });
    } finally {
        session.endSession();
    }
};

// 🔄 Update order status (vendor only)
export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { status } = req.body;
        const storeId = await getVendorStoreId(req.user._id.toString());

        const order = await Order.findOne({ _id: req.params.id, storeId }).session(session);
        if (!order) {
            await session.abortTransaction();
            res.status(404).json({ message: "Order not found or not authorized." });
            return;
        }

        // ✅ স্ট্যাটাস ফ্লো ভ্যালিডেশন
        const allowedNextStatuses = validTransitions[order.status] || [];
        if (!allowedNextStatuses.includes(status)) {
            await session.abortTransaction();
            res.status(400).json({
                message: `Cannot change status from "${order.status}" to "${status}".`,
            });
            return;
        }

        if (status === "Cancelled") {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } }, { session });
            }
        }

        order.status = status;
        await order.save({ session });

        await session.commitTransaction();
        res.status(200).json({ success: true, order });
    } catch (error: any) {
        await session.abortTransaction();
        res.status(500).json({ message: error.message || "Failed to update order status" });
    } finally {
        session.endSession();
    }
};