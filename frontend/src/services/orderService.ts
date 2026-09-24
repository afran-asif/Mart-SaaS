// src/services/orderService.ts
import { api } from "./api";

export interface OrderItem {
    product: {
        _id: string;
        name: string;
        price: number;
        images?: string[];
    };
    quantity: number;
    price: number;
}

export interface Order {
    _id: string;
    customerName: string;
    customerEmail: string;
    phone?: string;
    shippingAddress: string;
    totalAmount: number;
    status: "Pending" | "Processing" | "Delivered" | "Cancelled";
    items: OrderItem[];
    createdAt: string;
}

export interface CreateOrderPayload {
    customerName: string;
    customerEmail: string;
    shippingAddress: string;
    phone?: string;
    totalAmount: number;
    storeId: string; // ✅ কোন store এ order হচ্ছে
    items: {
        product: string;
        quantity: number;
        price: number;
    }[];
}

export interface OrdersQuery {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}

export interface PaginatedOrders {
    orders: Order[];
    totalOrders: number;
    page: number;
    limit: number;
    pages: number;
}

// 📥 Fetch this vendor's orders (paginated, token required)
export const getAllOrders = async (query: OrdersQuery = {}): Promise<PaginatedOrders> => {
    const response = await api.get("/orders", {
        params: {
            page: query.page || 1,
            limit: query.limit || 10,
            status: query.status || undefined,
            search: query.search || undefined,
        },
    });
    return {
        orders: response.data.orders || [],
        totalOrders: response.data.totalOrders || 0,
        page: response.data.page || 1,
        limit: response.data.limit || 10,
        pages: response.data.pages || 1,
    };
};

// ➕ Create a new order
export const createOrder = async (orderData: CreateOrderPayload) => {
    const response = await api.post("/orders", orderData);
    return response.data;
};

// 🔄 Update order status (vendor only)
export const updateOrderStatusApi = async (orderId: string, status: string) => {
    const response = await api.patch(`/orders/${orderId}/status`, { status });
    return response.data;
};