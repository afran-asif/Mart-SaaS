import { Response } from "express";
import { Store } from "../models/Store";
import { Plan } from "../models/Plan";
import { Subscription } from "../models/Subscription";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { getEffectivePlan, getUsage } from "../utils/plan";

const SUBSCRIPTION_DAYS = 30;

// GET /subscription/me — vendor নিজের plan + usage + payment info
export const getMySubscription = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const vendorId = req.user._id;
        const store = await Store.findOne({ vendorId });
        if (!store) {
            res.status(404).json({ message: "Store not found for this vendor" });
            return;
        }

        const usage = await getUsage(store);
        const proPlan = await Plan.findOne({ slug: "pro" }).lean();
        const pending = await Subscription.findOne({ storeId: store._id, status: "pending" })
            .sort({ createdAt: -1 })
            .lean();
        const history = await Subscription.find({ storeId: store._id, status: { $ne: "pending" } })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        const isTrial =
            store.plan === "pro" && !!store.planExpiresAt && new Date(store.planExpiresAt) > new Date() &&
            !(await Subscription.exists({ storeId: store._id, status: "active" }));

        res.status(200).json({
            success: true,
            subscription: {
                plan: usage.plan,
                storedPlan: store.plan,
                planExpiresAt: store.planExpiresAt,
                isTrial,
                usage: {
                    products: usage.products,
                    maxProducts: usage.limits.maxProducts,
                    ordersThisMonth: usage.ordersThisMonth,
                    maxOrdersPerMonth: usage.limits.maxOrdersPerMonth,
                },
                features: usage.limits,
                proPrice: proPlan?.priceMonthly ?? 499,
                bkashNumber: process.env.SUBSCRIPTION_BKASH_NUMBER || "",
                pendingRequest: pending
                    ? { id: pending._id, trxId: pending.trxId, createdAt: pending.createdAt }
                    : null,
                history: history.map((h) => ({
                    id: h._id,
                    plan: h.plan,
                    status: h.status,
                    amount: h.amount,
                    periodStart: h.periodStart,
                    periodEnd: h.periodEnd,
                    createdAt: h.createdAt,
                })),
            },
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// POST /subscription/request — vendor manual payment-এর TrxID জমা দেবে
export const requestSubscription = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const vendorId = req.user._id;
        const { trxId, senderNumber } = req.body as { trxId?: string; senderNumber?: string };

        if (!trxId?.trim() || !senderNumber?.trim()) {
            res.status(400).json({ message: "Transaction ID and sender number are required." });
            return;
        }

        const store = await Store.findOne({ vendorId });
        if (!store) {
            res.status(404).json({ message: "Store not found for this vendor" });
            return;
        }

        if (getEffectivePlan(store) === "pro") {
            res.status(400).json({ message: "You already have an active Pro plan." });
            return;
        }

        const existingPending = await Subscription.findOne({ storeId: store._id, status: "pending" });
        if (existingPending) {
            res.status(400).json({ message: "You already have a pending request. Please wait for approval." });
            return;
        }

        const proPlan = await Plan.findOne({ slug: "pro" }).lean();
        const sub = await Subscription.create({
            vendorId,
            storeId: store._id,
            plan: "pro",
            status: "pending",
            amount: proPlan?.priceMonthly ?? 499,
            trxId: trxId.trim(),
            senderNumber: senderNumber.trim(),
        });

        res.status(201).json({ success: true, message: "Request submitted. Pro will activate after verification.", request: { id: sub._id } });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// GET /subscription/requests — super-admin: pending (+ history)
export const listSubscriptionRequests = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const status = (req.query.status as string) || "pending";
        const filter: Record<string, unknown> = {};
        if (["pending", "active", "rejected", "expired", "cancelled"].includes(status)) {
            filter.status = status;
        }
        const requests = await Subscription.find(filter)
            .populate("storeId", "storeName subdomain")
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        res.status(200).json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// POST /subscription/requests/:id/approve — super-admin
export const approveSubscription = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const sub = await Subscription.findById(req.params.id);
        if (!sub || sub.status !== "pending") {
            res.status(404).json({ message: "Pending request not found." });
            return;
        }

        const store = await Store.findById(sub.storeId);
        if (!store) {
            res.status(404).json({ message: "Store not found." });
            return;
        }

        const now = new Date();
        const base = store.planExpiresAt && new Date(store.planExpiresAt) > now ? new Date(store.planExpiresAt) : now;
        const periodEnd = new Date(base.getTime() + SUBSCRIPTION_DAYS * 24 * 60 * 60 * 1000);

        store.plan = "pro";
        store.planExpiresAt = periodEnd;
        await store.save();

        sub.status = "active";
        sub.periodStart = now;
        sub.periodEnd = periodEnd;
        sub.reviewedBy = req.user._id;
        sub.reviewedAt = now;
        await sub.save();

        // আগের active গুলো expired করো (একটাই active থাকবে)
        await Subscription.updateMany(
            { storeId: store._id, status: "active", _id: { $ne: sub._id } },
            { $set: { status: "expired" } }
        );

        res.status(200).json({ success: true, message: "Pro activated for 30 days.", periodEnd });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// POST /subscription/requests/:id/reject — super-admin
export const rejectSubscription = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const sub = await Subscription.findById(req.params.id);
        if (!sub || sub.status !== "pending") {
            res.status(404).json({ message: "Pending request not found." });
            return;
        }
        sub.status = "rejected";
        sub.adminNote = (req.body?.adminNote as string) || "";
        sub.reviewedBy = req.user._id;
        sub.reviewedAt = new Date();
        await sub.save();
        res.status(200).json({ success: true, message: "Request rejected." });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};