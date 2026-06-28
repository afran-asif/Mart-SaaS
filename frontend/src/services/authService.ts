import { api } from "./api";

export const registerVendor = async ( vendorData: any ) => {
    const response = await api.post("/auth/register", vendorData);
    return response.data;
}