import { api } from "./api";

export const registerVendor = async ( vendorData: any ) => {
    const response = await api.post("/auth/register", vendorData);
    return response.data;
}

export const loginVendor = async ( credentials: any ) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
}