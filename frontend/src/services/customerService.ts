import { api } from "./api";

export interface Customer {
    _id: string;
    customerName: string;
    customerEmail: string;
    phone?: string;
    shippingAddress?: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderAt: string;
}

export interface PaginatedCustomers {
    customers: Customer[];
    totalCustomers: number;
    page: number;
    limit: number;
    pages: number;
}

export const getCustomers = async (params: { page?: number; limit?: number; search?: string } = {}): Promise<PaginatedCustomers> => {
    const response = await api.get("/orders/customers", { params });
    return response.data;
};