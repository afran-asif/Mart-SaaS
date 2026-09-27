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