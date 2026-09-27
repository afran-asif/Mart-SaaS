import { api } from "./api";

export interface SubRequest {
    _id: string;
    plan: string;
    status: string;
    amount: number;
    trxId?: string;
    senderNumber?: string;
    adminNote?: string;
    periodStart?: string;
    periodEnd?: string;
    createdAt: string;
    storeId?: { storeName?: string; subdomain?: string } | string;
}

export const listSubRequests = async (status = "pending"): Promise<SubRequest[]> => {
    const res = await api.get("/subscription/requests", { params: { status } });
    return res.data.requests as SubRequest[];
};

export const approveSubRequest = async (id: string) => {
    const res = await api.post(`/subscription/requests/${id}/approve`);
    return res.data;
};

export const rejectSubRequest = async (id: string, adminNote?: string) => {
    const res = await api.post(`/subscription/requests/${id}/reject`, { adminNote });
    return res.data;
};

export interface PlatformStats {
    totalStores: number;
    activeStores: number;
    suspendedStores: number;
    proStores: number;
    expiringPro: number;
    totalOrders: number;
    monthOrders: number;
    todayOrders: number;
    failedOrdersMonth: number;
    monthRevenue: number;
    pendingRequests: number;
}

export const getPlatformStats = async (): Promise<PlatformStats> => {
    const res = await api.get("/admin/stats");
    return res.data.stats as PlatformStats;
};

export interface AdminStore {
    id: string;
    storeName: string;
    subdomain: string;
    customDomain?: string | null;
    status: string;
    plan: string;
    storedPlan?: string;
    planExpiresAt?: string | null;
    products: number;
    orders: number;
    vendorName: string;
    vendorEmail: string;
    createdAt: string;
}

export const listAdminStores = async (search = ""): Promise<AdminStore[]> => {
    const res = await api.get("/admin/stores", { params: { search } });
    return res.data.stores as AdminStore[];
};

export const setAdminStorePlan = async (id: string, plan: string, days = 30) => {
    const res = await api.patch(`/admin/stores/${id}/plan`, { plan, days });
    return res.data;
};

export const setAdminStoreStatus = async (id: string, status: string) => {
    const res = await api.patch(`/admin/stores/${id}/status`, { status });
    return res.data;
};

export const listAdminOrders = async (page = 1) => {
    const res = await api.get("/admin/orders", { params: { page, limit: 15 } });
    return res.data as { total: number; page: number; orders: any[] };
};

export const impersonateStore = async (id: string): Promise<string> => {
    const res = await api.post(`/admin/stores/${id}/impersonate`);
    return res.data.url as string;
};