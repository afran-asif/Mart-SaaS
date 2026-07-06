import axios from "axios";

const API_URL = "http://localhost:5000/api/v1/products";

// 🔐 ফাইল আপলোডের সুবিধার্থে হেডার লজিক আলাদা করা হলো
const getAuthHeaders = (isFormData = false) => {
    const token = localStorage.getItem("token");
    const headers: any = {
        Authorization: `Bearer ${token}`,
    };
    
    // যদি ফর্ম-ডেটা না হয়, তবেই কেবল JSON সেট করব
    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }

    return {
        headers,
        withCredentials: true,
    };
};

// ১. সব প্রোডাক্ট নিয়ে আসার এপিআই
export const getAllProducts = async () => {
    const response = await axios.get(`${API_URL}`, getAuthHeaders(false));
    return response.data;
}

// 📤 ২. নতুন প্রোডাক্ট যোগ করার এপিআই (FormData সাপোর্টসহ)
export const createProduct = async (formData: FormData) => {
    const response = await axios.post(`${API_URL}`, formData, getAuthHeaders(true));
    return response.data;
};

// 🗑️ ৩. প্রোডাক্ট ডিলিট করার এপিআই (Axios সংস্করণ)
export const deleteProductApi = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders(false));
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to delete product");
    }
};

// 🔄 ৪. প্রোডাক্ট আপডেট করার এপিআই (JSON অবজেক্ট এবং JSON হেডারসহ)
export const updateProductApi = async (
    id: string,
    productData: {
        name: string;
        price: number;
        stock: number;
        category: string;
        description: string;
    }
): Promise<{ success: boolean; message: string; product: any }> => {
    try {
        const response = await axios.put(
            `${API_URL}/${id}`,
            productData,
            getAuthHeaders(false)
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to update product");
    }
};