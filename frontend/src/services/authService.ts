import { api } from "./api";

export const registerVendor = async ( vendorData: any ) => {
    const response = await api.post("/auth/register", vendorData);
    return response.data;
}

export const loginVendor = async ( credentials: any ) => {
    const response = await api.post("/auth/login", credentials);
    // 🔑 Auth httpOnly cookie-তে হয় (server Set-Cookie) — localStorage-এ token রাখা হয় না
    return response.data;
}

export const logoutVendor = async () => {
    try {
        await api.post("/auth/logout");
    } catch {
        // cookie না থাকলেও client state clear হবে
    }
}

export const fetchMe = async () => {
    const response = await api.get("/auth/me");
    return response.data;
}

export const verifyEmailToken = async (token: string) => {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
}

export const resendVerificationEmail = async (email: string) => {
    const response = await api.post("/auth/resend-verification", { email });
    return response.data;
}

export const forgotPassword = async (email: string) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
}

export const resetPassword = async (token: string, password: string) => {
    const response = await api.post("/auth/reset-password", { password, token });
    return response.data;
}