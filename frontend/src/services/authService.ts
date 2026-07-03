import { api } from "./api";

export const registerVendor = async ( vendorData: any ) => {
    const response = await api.post("/auth/register", vendorData);
    
    // 🔑 রেজিস্ট্রেশন সফল হলে টোকেনটি localStorage-এ সেভ করা হচ্ছে
    if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
    }
    
    return response.data;
}

export const loginVendor = async ( credentials: any ) => {
    const response = await api.post("/auth/login", credentials);
    
    // 🔑 লগইন সফল হলে টোকেনটি localStorage-এ সেভ করা হচ্ছে
    if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
    }
    
    return response.data;
}