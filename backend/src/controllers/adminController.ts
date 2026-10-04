import { Response } from "express";
import crypto from "crypto";
import { Store } from "../models/Store";
import { User } from "../models/User";
import { Subscription } from "../models/Subscription";
import { ImpersonationLog } from "../models/ImpersonationLog";
import Order from "../models/Order";
import { Product } from "../models/Product";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { getEffectivePlan } from "../utils/plan";
import { cacheDelTenantStore } from "../utils/cache";
import { Review } from "../models/Review";
import { reverifyCustomDomains } from "../jobs/reverifyCustomDomains";

// GET /admin/stores — সব store + vendor + plan + counts
export const listStores = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const search = ((req.query.search as string) || "").trim();
        const filter: Record<string, unknown> = {};
        if (search) {
            filter.$or = [
                { storeName: { $regex: search, $options: "i" } },
                { subdomain: { $regex: search, $options: "i" } },
                { customDomain: { $regex: search, $options: "i" } },
            ];
        }
        const stores = await Store.find(filter).sort({ createdAt: -1 }).limit(100).lean();
        const vendorIds = stores.map((s) => s.vendorId);
        const users = await User.find({ _id: { $in: vendorIds } }).select("name email").lean();
        const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));

        const result = await Promise.all(
            stores.map(async (s: any) => {
                const [products, orders] = await Promise.all([
                    Product.countDocuments({ storeId: s._id }),
                    Order.countDocuments({ storeId: s._id, status: { $ne: "Cancelled" } }),
                ]);
                const vendor: any = userMap.get(s.vendorId?.toString());
                return {
                    id: s._id,
                    storeName: s.storeName,
                    subdomain: s.subdomain,
                    customDomain: s.customDomain,
                    status: s.status,
                    plan: getEffectivePlan(s),
                    storedPlan: s.plan,
                    planExpiresAt: s.planExpiresAt,
                    products,
                    orders,
                    vendorName: vendor?.name || "",
                    vendorEmail: vendor?.email || "",
                    createdAt: s.createdAt,
                };
            })
        );
        res.status(200).json({ success: true, stores: result });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// PATCH /admin/stores/:id/plan — manual upgrade/downgrade/extend { plan, days? }
export const setStorePlan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { plan, days } = req.body as { plan?: string; days?: number };
        if (!["free", "pro"].includes(plan || "")) {
            res.status(400).json({ message: "Plan must be free or pro." });
            return;
        }
        const store = await Store.findById(req.params.id);
        if (!store) {
            res.status(404).json({ message: "Store not found." });
            return;
        }
        if (plan === "pro") {
            const durationDays = Number(days) > 0 ? Number(days) : 30;
            const now = new Date();
            const base = store.planExpiresAt && new Date(store.planExpiresAt) > now ? new Date(store.planExpiresAt) : now;
            store.planExpiresAt = new Date(base.getTime() + durationDays * 24 * 60 * 60 * 1000);
        } else {
            store.planExpiresAt = null;
        }
        store.plan = plan as "free" | "pro";
        await store.save();
        await cacheDelTenantStore(store.subdomain, store.customDomain);
        res.status(200).json({ success: true, plan: store.plan, planExpiresAt: store.planExpiresAt });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// PATCH /admin/stores/:id/status — suspend/activate { status }
export const setStoreStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { status } = req.body as { status?: string };
        if (!["active", "suspended"].includes(status || "")) {
            res.status(400).json({ message: "Status must be active or suspended." });
            return;
        }
        const store = await Store.findById(req.params.id);
        if (!store) {
            res.status(404).json({ message: "Store not found." });
            return;
        }
        store.status = status as "active" | "suspended";
        await store.save();
        await cacheDelTenantStore(store.subdomain, store.customDomain);
        res.status(200).json({ success: true, status: store.status });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// GET /admin/orders — platform-wide orders (?storeId, ?page, ?limit)
export const listAllOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
        const filter: Record<string, unknown> = {};
        if (req.query.storeId) filter.storeId = req.query.storeId;
        if (req.query.status) filter.status = req.query.status;
        const [total, orders] = await Promise.all([
            Order.countDocuments(filter),
            Order.find(filter)
                .populate("storeId", "storeName subdomain")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
        ]);
        res.status(200).json({ success: true, total, page, orders });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// POST /admin/stores/:id/impersonate — one-time token বানানো (5 মিনিট, single-use)
// Admin মূল tab-এ থাকে, vendor session নতুন tab-এ খোলে — admin session নষ্ট হয় না
export const impersonateVendor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const store = await Store.findById(req.params.id);
        if (!store) {
            res.status(404).json({ message: "Store not found." });
            return;
        }
        const vendor = await User.findById(store.vendorId).select("_id");
        if (!vendor) {
            res.status(404).json({ message: "Vendor not found." });
            return;
        }

        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
        await ImpersonationLog.create({
            adminId: req.user._id,
            vendorId: vendor._id,
            storeId: store._id,
            tokenHash,
            used: false,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });

        const baseUrl = process.env.BACKEND_URL || "http://localhost:5000";
        res.status(200).json({
            success: true,
            url: `${baseUrl}/api/v1/auth/impersonate/cb/${rawToken}`,
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// GET /admin/notifications — unified alerts feed
export const getNotificationsFeed = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const now = new Date();
        const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const [pendingSubs, expiringPros, recentReviews] = await Promise.all([
            Subscription.find({ status: "pending" })
                .populate("storeId", "storeName subdomain")
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
            Store.find({ plan: "pro", planExpiresAt: { $lte: weekLater } })
                .select("storeName subdomain planExpiresAt")
                .sort({ planExpiresAt: 1 })
                .limit(10)
                .lean(),
            Review.find({})
                .populate("storeId", "storeName subdomain")
                .populate("productId", "name")
                .sort({ createdAt: -1 })
                .limit(10)
                .select("customerName rating comment verifiedBuyer createdAt storeId productId")
                .lean(),
        ]);
        const pendingCount = await Subscription.countDocuments({ status: "pending" });
        res.status(200).json({
            success: true,
            alerts: {
                pendingSubs: { count: pendingCount, latest: pendingSubs },
                expiringPros: { count: expiringPros.length, list: expiringPros },
                recentReviews: { count: recentReviews.length, list: recentReviews },
            },
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// GET /admin/stats — platform overview
export const getPlatformStats = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const [
            totalStores,
            activeStores,
            suspendedStores,
            proStores,
            expiringPro,
            totalOrders,
            monthOrders,
            todayOrders,
            failedOrdersMonth,
            monthRevenue,
            pendingRequests,
        ] = await Promise.all([
            Store.countDocuments({}),
            Store.countDocuments({ status: "active" }),
            Store.countDocuments({ status: "suspended" }),
            Store.countDocuments({ plan: "pro", planExpiresAt: { $gt: now } }),
            Store.countDocuments({ plan: "pro", planExpiresAt: { $gt: now, $lte: weekLater } }),
            Order.countDocuments({ status: { $ne: "Cancelled" } }),
            Order.countDocuments({ status: { $ne: "Cancelled" }, createdAt: { $gte: monthStart } }),
            Order.countDocuments({ status: { $ne: "Cancelled" }, createdAt: { $gte: dayStart } }),
            Order.countDocuments({ paymentStatus: { $in: ["Failed", "Cancelled"] }, createdAt: { $gte: monthStart } }),
            Order.aggregate([
                { $match: { status: { $ne: "Cancelled" }, createdAt: { $gte: monthStart } } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } },
            ]),
            Subscription.countDocuments({ status: "pending" }),
        ]);
        res.status(200).json({
            success: true,
            stats: {
                totalStores,
                activeStores,
                suspendedStores,
                proStores,
                expiringPro,
                totalOrders,
                monthOrders,
                todayOrders,
                failedOrdersMonth,
                monthRevenue: monthRevenue[0]?.total || 0,
                pendingRequests,
            },
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// POST /admin/domains/reverify — super-admin manual trigger (daily job-এর বাইরে)
export const reverifyDomains = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const summary = await reverifyCustomDomains();
        res.status(200).json({ success: true, summary });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};