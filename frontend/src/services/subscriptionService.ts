import { api } from "./api";

export interface SubscriptionUsage {
    products: number;
    maxProducts: number | null;
    ordersThisMonth: number;
    maxOrdersPerMonth: number | null;
}

export interface SubscriptionFeatures {
    maxProducts: number | null;
    maxOrdersPerMonth: number | null;
    themes: string[];
    customDomain: boolean;
    coupons: boolean;
    pixels: boolean;
    ownGateway: boolean;
}

export interface SubscriptionInfo {
    plan: "free" | "pro";
    storedPlan?: string;
    planExpiresAt?: string | null;
    isTrial: boolean;
    locked: boolean;
    usage: SubscriptionUsage;
    features: SubscriptionFeatures;
    proPrice: number;
    planPrices: Array<{ months: number; days: number; amount: number }>;
    bkashNumber: string;
    pendingRequest: { id: string; trxId?: string; createdAt: string; durationMonths?: number; amount?: number } | null;
    lastRejected: { adminNote: string; createdAt: string } | null;
    history: Array<{
        id: string;
        plan: string;
        status: string;
        amount: number;
        durationMonths?: number;
        adminNote?: string;
        periodStart?: string;
        periodEnd?: string;
        createdAt: string;
    }>;
}

export const getMySubscription = async (): Promise<SubscriptionInfo> => {
    const res = await api.get("/subscription/me");
    return res.data.subscription as SubscriptionInfo;
};

export const requestSubscription = async (trxId: string, senderNumber: string, durationMonths = 1) => {
    const res = await api.post("/subscription/request", { trxId, senderNumber, durationMonths });
    return res.data;
};