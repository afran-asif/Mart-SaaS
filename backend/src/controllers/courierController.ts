import { Response } from "express";
import Order from "../models/Order";
import { Store } from "../models/Store";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { decrypt } from "../utils/encryption";
import { createConsignment, getConsignmentStatus, checkSteadfastBalance } from "../utils/steadfast";

// vendor-এর store + decrypted Steadfast keys (keys না থাকলে 400 সহ null)
const getSteadfastCreds = async (vendorId: string) => {
    const store = await Store.findOne({ vendorId }).select(
        "+steadfastApiKey +steadfastSecretKey"
    );
    if (!store) return { error: "Store not found for this vendor", store: null, creds: null };
    if (!store.steadfastApiKey || !store.steadfastSecretKey) {
        return { error: "Steadfast keys not configured. Add them in Settings → Courier.", store, creds: null };
    }
    try {
        return {
            error: null,
            store,
            creds: {
                apiKey: decrypt(store.steadfastApiKey),
                secretKey: decrypt(store.steadfastSecretKey),
            },
        };
    } catch {
        return { error: "Could not decrypt Steadfast keys. Re-save them in Settings.", store, creds: null };
    }
};

// POST /courier/steadfast/send/:orderId — COD order Steadfast-এ পাঠানো
export const sendToSteadfast = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const vendorId = req.user._id.toString();
        const { error, store, creds } = await getSteadfastCreds(vendorId);
        if (error || !store || !creds) {
            res.status(400).json({ message: error || "Steadfast not configured" });
            return;
        }
        const order = await Order.findOne({ _id: req.params.orderId, storeId: store._id });
        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        if (order.status === "Cancelled") {
            res.status(400).json({ message: "Cancelled orders cannot be sent to courier" });
            return;
        }
        if (order.consignmentId) {
            res.status(400).json({
                message: "Already sent to courier",
                consignmentId: order.consignmentId,
                trackingCode: order.trackingCode,
            });
            return;
        }
        if (!order.phone) {
            res.status(400).json({ message: "Order has no customer phone number" });
            return;
        }

        const addressParts = [order.shippingAddress, order.thana, order.shippingDistrict]
            .filter(Boolean)
            .join(", ");
        const result = await createConsignment(creds, {
            invoice: `VD-${order._id.toString().slice(-8).toUpperCase()}`,
            recipientName: order.customerName,
            recipientPhone: order.phone.replace(/\D/g, ""),
            recipientAddress: addressParts,
            codAmount: order.paymentStatus === "Paid" ? 0 : order.totalAmount,
            note: `Shopilika order ${order._id}`,
        });

        order.courierProvider = "steadfast";
        order.consignmentId = result.consignmentId;
        order.trackingCode = result.trackingCode || null;
        order.courierStatus = "created";
        order.courierSyncedAt = new Date();
        await order.save();

        res.status(200).json({
            success: true,
            message: "Order sent to Steadfast",
            consignmentId: result.consignmentId,
            trackingCode: result.trackingCode,
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message || "Failed to send order to Steadfast" });
    }
};

// GET /courier/steadfast/status/:orderId — Steadfast থেকে fresh status এনে save
export const refreshCourierStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const vendorId = req.user._id.toString();
        const { error, store, creds } = await getSteadfastCreds(vendorId);
        if (error || !store || !creds) {
            res.status(400).json({ message: error || "Steadfast not configured" });
            return;
        }
        const order = await Order.findOne({ _id: req.params.orderId, storeId: store._id });
        if (!order || !order.consignmentId) {
            res.status(404).json({ message: "No consignment found for this order" });
            return;
        }
        const { status } = await getConsignmentStatus(creds, order.consignmentId);
        order.courierStatus = status;
        order.courierSyncedAt = new Date();
        await order.save();
        res.status(200).json({ success: true, courierStatus: status, syncedAt: order.courierSyncedAt });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message || "Failed to refresh courier status" });
    }
};

// GET /courier/steadfast/balance — key valid কিনা + balance
export const getCourierBalance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { error, creds } = await getSteadfastCreds(req.user._id.toString());
        if (error || !creds) {
            res.status(400).json({ message: error || "Steadfast not configured" });
            return;
        }
        const { balance } = await checkSteadfastBalance(creds);
        res.status(200).json({ success: true, balance });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message || "Failed to check Steadfast balance" });
    }
};
