import { Response } from "express";
import { Types } from "mongoose";
import { Plan, DEFAULT_PLANS } from "../models/Plan";
import { Product } from "../models/Product";
import Order from "../models/Order";

export type PlanSlug = "free" | "pro";

interface StoreLike {
    plan?: string;
    planExpiresAt?: Date | null;
}

// মেয়াদোত্তীর্ণ pro → free হিসেবে গণ্য (cron ছাড়াই, প্রতি request-এ হিসাব)
export const getEffectivePlan = (store: StoreLike): PlanSlug => {
    if (store.plan === "pro") {
        if (!store.planExpiresAt || new Date(store.planExpiresAt) > new Date()) {
            return "pro";
        }
    }
    return "free";
};

export const getPlanLimits = async (plan: PlanSlug) => {
    const found = await Plan.findOne({ slug: plan }).lean();
    if (found) return found;
    const fallback = DEFAULT_PLANS.find((p) => p.slug === plan);
    return fallback!;
};

// 403 পাঠিয়ে pro-gate — true মানে pro আছে (এগোতে পারো)
export const requirePro = (store: StoreLike, res: Response, feature: string): boolean => {
    if (getEffectivePlan(store) !== "pro") {
        res.status(403).json({ message: `${feature} is a Pro feature. Please upgrade your plan.`, proRequired: true });
        return false;
    }
    return true;
};

export const checkProductLimit = async (store: { _id: Types.ObjectId } & StoreLike): Promise<string | null> => {
    const plan = getEffectivePlan(store);
    const limits = await getPlanLimits(plan);
    if (limits.maxProducts === null || limits.maxProducts === undefined) return null;
    const count = await Product.countDocuments({ storeId: store._id });
    if (count >= limits.maxProducts) {
        return `Product limit reached (${limits.maxProducts} on ${limits.name} plan). Please upgrade to Pro for unlimited products.`;
    }
    return null;
};

export const checkMonthlyOrderLimit = async (store: { _id: Types.ObjectId } & StoreLike): Promise<string | null> => {
    const plan = getEffectivePlan(store);
    const limits = await getPlanLimits(plan);
    if (limits.maxOrdersPerMonth === null || limits.maxOrdersPerMonth === undefined) return null;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const count = await Order.countDocuments({
        storeId: store._id,
        status: { $ne: "Cancelled" },
        createdAt: { $gte: monthStart },
    });
    if (count >= limits.maxOrdersPerMonth) {
        return `Monthly order limit reached (${limits.maxOrdersPerMonth} on ${limits.name} plan). Please upgrade to Pro for unlimited orders.`;
    }
    return null;
};

export const getUsage = async (store: { _id: Types.ObjectId } & StoreLike) => {
    const plan = getEffectivePlan(store);
    const limits = await getPlanLimits(plan);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [products, ordersThisMonth] = await Promise.all([
        Product.countDocuments({ storeId: store._id }),
        Order.countDocuments({
            storeId: store._id,
            status: { $ne: "Cancelled" },
            createdAt: { $gte: monthStart },
        }),
    ]);
    return {
        plan,
        limits: {
            maxProducts: limits.maxProducts,
            maxOrdersPerMonth: limits.maxOrdersPerMonth,
            themes: limits.themes,
            customDomain: limits.customDomain,
            coupons: limits.coupons,
            pixels: limits.pixels,
            ownGateway: limits.ownGateway,
        },
        products,
        ordersThisMonth,
    };
};