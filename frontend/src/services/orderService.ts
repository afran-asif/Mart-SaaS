// src/services/orderService.ts
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
    shippingAddress: string;
    totalAmount: number;
    status: "Pending" | "Processing" | "Delivered" | "Cancelled";
    items: OrderItem[];
    createdAt: string;
}

// Fetch all orders
export const getAllOrders = async (): Promise<Order[]> => {
    const response = await axios.get(`${API_URL}/orders`);
    return response.data.orders || response.data;
};

// Update order status
export const updateOrderStatusApi = async (orderId: string, status: string) => {
    const response = await axios.patch(`${API_URL}/orders/${orderId}/status`, { status });
    return response.data;
};