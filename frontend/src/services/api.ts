import axios from "axios";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
    withCredentials: true,
});

// ✅ Tenant identifier বের করার হেল্পার — subdomain অথবা custom domain
const getSubdomain = (): string | null => {
    if (typeof window === "undefined") return null;

    const raw = window.location.hostname;

    // main domain গুলো — কোনো tenant নেই
    if (
        raw === "localhost" ||
        raw === "mart-saa-s.vercel.app" ||
        raw === "vendoo.shop" ||
        raw === "www.vendoo.shop" ||
        raw === "www.localhost"
    ) {
        return null;
    }

    // www. prefix থাকলে বাদ (www.shop.x.com → shop.x.com)
    const hostname = raw.startsWith("www.") ? raw.slice(4) : raw;
    const parts = hostname.split(".");

    if (
        hostname === "localhost" ||
        hostname === "mart-saa-s.vercel.app" ||
        hostname === "vendoo.shop"
    ) {
        return null;
    }

    const isSubOfBase = ["localhost", "vendoo.shop", "mart-saa-s.vercel.app"].some(
        (b) => hostname.endsWith(`.${b}`)
    );

    if (isSubOfBase && parts.length >= 2) {
        return parts[0]; // প্রথম অংশটাই subdomain
    }

    // Custom domain — পুরো hostname-ই identifier
    return hostname;
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