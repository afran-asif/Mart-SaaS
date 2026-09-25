import { api } from "./api";

export interface Coupon {
    _id: string;
    code: string;
    discountType: "percent" | "fixed";
    discountValue: number;
    minOrderAmount: number;
    maxUses: number | null;
    usedCount: number;
    expiresAt: string | null;
    isActive: boolean;
}

export const getCoupons = async (): Promise<Coupon[]> => {
    const res = await api.get("/coupons");
    return res.data.coupons || [];
};

export const createCoupon = async (data: Partial<Coupon> & { code: string; discountType: string; discountValue: number }) => {
    const res = await api.post("/coupons", data);
    return res.data;
};

export const updateCoupon = async (id: string, data: Partial<Coupon>) => {
    const res = await api.put(`/coupons/${id}`, data);
    return res.data;
};

export const deleteCoupon = async (id: string) => {
    const res = await api.delete(`/coupons/${id}`);
    return res.data;
};

export const validateCoupon = async (code: string, subtotal: number) => {
    const res = await api.get("/coupons/validate", { params: { code, subtotal } });
    return res.data as { success: boolean; discount: number; coupon: Coupon };
};