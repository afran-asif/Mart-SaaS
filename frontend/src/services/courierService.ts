// src/services/courierService.ts
import { api } from "./api";

export const sendOrderToSteadfast = async (orderId: string) => {
    const response = await api.post(`/courier/steadfast/send/${orderId}`);
    return response.data;
};

export const refreshCourierStatus = async (orderId: string) => {
    const response = await api.get(`/courier/steadfast/status/${orderId}`);
    return response.data;
};

export const getCourierBalance = async () => {
    const response = await api.get("/courier/steadfast/balance");
    return response.data;
};
