import axios from "axios";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
    withCredentials: true,
});

// ✅ প্রতিটি request-এ localStorage থেকে token যুক্ত করা
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// ✅ Response error interceptor — backend এর actual error message বের করা
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Something went wrong";
        return Promise.reject(new Error(message));
    }
);