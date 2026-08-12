import axios from "axios";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
    withCredentials: true,
});

// ✅ Subdomain বের করার হেল্পার ফাংশন
const getSubdomain = (): string | null => {
    if (typeof window === "undefined") return null;

    const hostname = window.location.hostname; // যেমন: sestone.localhost বা sestone.yourdomain.com
    const parts = hostname.split(".");

    // লোকাল ডেভেলপমেন্টে: sestone.localhost → ["sestone", "localhost"]
    // প্রোডাকশনে: sestone.yourdomain.com → ["sestone", "yourdomain", "com"]
    if (hostname === "localhost" || hostname === "yourdomain.com" || hostname.startsWith("www.")) {
        return null; // main domain, কোনো subdomain নেই
    }

    if (parts.length >= 2) {
        return parts[0]; // প্রথম অংশটাই subdomain
    }

    return null;
};

// ✅ প্রতিটি request-এ token + tenant subdomain যুক্ত করা
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const subdomain = getSubdomain();
        if (subdomain) {
            config.headers["X-Tenant-Subdomain"] = subdomain;
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