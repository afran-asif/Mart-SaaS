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

// 📥 Fetch all orders for this vendor (token required)
export const getAllOrders = async (): Promise<Order[]> => {
    const response = await api.get("/orders");
    return response.data.orders || response.data;
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