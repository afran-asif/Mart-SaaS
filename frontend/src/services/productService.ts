import { api } from "./api";

// 📄 প্রোডাক্ট ইন্টারফেস
export interface GetProductsParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
}

export interface Product {
    _id: string;
    name: string;
    price: number;
    category?: string;
    stock?: number;
    image?: string;
    images?: string[];
    description?: string;
}

// 🔍 ১. সব প্রোডাক্ট নিয়ে আসার এপিআই
export const getAllProducts = async (params: GetProductsParams = {}) => {
    const response = await api.get("/products", {
        params: {
            page: params.page || 1,
            limit: params.limit || 10,
            search: params.search || undefined,
            category: params.category || undefined,
        },
    });
    return response.data;
};

// 📤 ২. নতুন প্রোডাক্ট যোগ করার এপিআই (FormData সাপোর্টসহ)
export const createProduct = async (formData: FormData) => {
    const response = await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

// 🗑️ ৩. প্রোডাক্ট ডিলিট করার এপিআই
export const deleteProductApi = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to delete product");
    }
};

// 🔄 ৪. প্রোডাক্ট আপডেট করার এপিআই (FormData বা JSON অবজেক্ট সহ)
export const updateProductApi = async (
    id: string,
    productData: FormData | {
        name: string;
        price: number;
        stock: number;
        category: string;
        description: string;
        existingImages?: string[];
    }
): Promise<{ success: boolean; message: string; product: any }> => {
    try {
        const isFormData = productData instanceof FormData;
        const config = isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
        const response = await api.put(`/products/${id}`, productData, config);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to update product");
    }
};