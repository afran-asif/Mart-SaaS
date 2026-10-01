import { api } from "./api";

export interface TenantReview {
    _id?: string;
    customerName: string;
    rating: number;
    comment?: string;
    verifiedBuyer?: boolean;
    createdAt?: string;
}

export interface VendorReview extends TenantReview {
    _id: string;
    phone?: string;
    visible: boolean;
    productId?: { _id: string; name: string; images?: string[] } | string;
}

export const getTenantReviews = async (productId: string) => {
    const res = await api.get("/tenant/reviews", { params: { productId } });
    return res.data as { success: boolean; count: number; average: number; reviews: TenantReview[] };
};

export const createTenantReview = async (payload: {
    productId: string;
    customerName: string;
    phone: string;
    rating: number;
    comment?: string;
    orderId?: string;
}) => {
    const res = await api.post("/tenant/reviews", payload);
    return res.data;
};

export const getVendorReviews = async () => {
    const res = await api.get("/reviews");
    return (res.data.reviews || []) as VendorReview[];
};

export const toggleReviewVisibility = async (id: string) => {
    const res = await api.patch(`/reviews/${id}/visibility`);
    return res.data;
};

export const deleteVendorReview = async (id: string) => {
    const res = await api.delete(`/reviews/${id}`);
    return res.data;
};
