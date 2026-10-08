import { Response } from "express";
import { Store } from "../models/Store";
import { Plan } from "../models/Plan";
import { Subscription } from "../models/Subscription";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { getEffectivePlan, getUsage, isStoreLocked } from "../utils/plan";
import { cacheDelTenantStore } from "../utils/cache";

const SUBSCRIPTION_DAYS = 30;

// Pro duration pricing — 1mo 499 (50% off), 3mo 1199 (60% off), 6mo 1999 (67% off)
export const PLAN_DURATIONS = [
    { months: 1, days: 30, amount: 499 },
    { months: 3, days: 90, amount: 1199 },
    { months: 6, days: 180, amount: 1999 },
] as const;

export const getPlanPrice = (months: number): number | null => {
    const found = PLAN_DURATIONS.find((p) => p.months === months);
    return found ? found.amount : null;
};

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

        const lastRejected = await Subscription.findOne({ storeId: store._id, status: "rejected" })
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            subscription: {
                plan: usage.plan,
                storedPlan: store.plan,
                planExpiresAt: store.planExpiresAt,
                isTrial,
                locked: isStoreLocked(store),
                usage: {
                    products: usage.products,
                    maxProducts: usage.limits.maxProducts,
                    ordersThisMonth: usage.ordersThisMonth,
                    maxOrdersPerMonth: usage.limits.maxOrdersPerMonth,
                },
                features: usage.limits,
                proPrice: proPlan?.priceMonthly ?? 499,
                planPrices: PLAN_DURATIONS.map((p) => ({ months: p.months, days: p.days, amount: p.amount })),
                bkashNumber: process.env.SUBSCRIPTION_BKASH_NUMBER || "",
                pendingRequest: pending
                    ? { id: pending._id, trxId: pending.trxId, createdAt: pending.createdAt, durationMonths: (pending as any).durationMonths || 1, amount: (pending as any).amount }
                    : null,
                lastRejected: lastRejected
                    ? { adminNote: lastRejected.adminNote || "", createdAt: lastRejected.createdAt }
                    : null,
                history: history.map((h) => ({
                    id: h._id,
                    plan: h.plan,
                    status: h.status,
                    amount: h.amount,
                    durationMonths: (h as any).durationMonths || 1,
                    adminNote: h.adminNote || "",
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
        const { trxId, senderNumber, durationMonths } = req.body as { trxId?: string; senderNumber?: string; durationMonths?: number };

        if (!trxId?.trim() || !senderNumber?.trim()) {
            res.status(400).json({ message: "Transaction ID and sender number are required." });
            return;
        }

        const months = Number(durationMonths) || 1;
        const price = getPlanPrice(months);
        if (!price) {
            res.status(400).json({ message: "Invalid plan duration. Choose 1, 3 or 6 months." });
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
            amount: price,
            durationMonths: months,
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
        const durationDays = (sub.durationMonths || 1) * SUBSCRIPTION_DAYS;
        const periodEnd = new Date(base.getTime() + durationDays * 24 * 60 * 60 * 1000);

        store.plan = "pro";
        store.planExpiresAt = periodEnd;
        // renew হলে পুরনো reminder marker মুছে যায় (পরের cycle-এ আবার যাবে)
        store.trialReminder3dSentAt = null;
        store.trialReminder1dSentAt = null;
        store.trialExpiredSentAt = null;
        await store.save();
        await cacheDelTenantStore(store.subdomain, store.customDomain);

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

        res.status(200).json({ success: true, message: `Pro activated for ${durationDays} days.`, periodEnd });
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