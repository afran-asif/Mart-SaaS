import axios from "axios";

const API_URL = "http://localhost:5000/api/v1/products";

// 🔐 ফাইল আপলোডের সুবিধার্থে হেডার লজিক আলাদা করা হলো
const getAuthHeaders = (isFormData = false) => {
    const token = localStorage.getItem("token");
    const headers: any = {
        Authorization: `Bearer ${token}`,
    };
    
    // যদি ফর্ম-ডেটা না হয়, তবেই কেবল JSON সেট করব
    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }

    return {
        headers,
        withCredentials: true,
    };
};

export const getAllProducts = async () => {
    const response = await axios.get(`${API_URL}`, getAuthHeaders(false));
    return response.data;
}

// 📤 ২. নতুন প্রোডাক্ট যোগ করার এপিআই (FormData সাপোর্টসহ)
export const createProduct = async (formData: FormData) => {
    // এখানে getAuthHeaders(true) পাস করা হয়েছে যাতে Content-Type ব্রাউজার হ্যান্ডেল করে
    const response = await axios.post(`${API_URL}`, formData, getAuthHeaders(true));
    return response.data;
};

// src/services/productService.ts

export const deleteProductApi = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
        // ফাংশন নিজেই লোকাল স্টোরেজ থেকে ফ্রেশ টোকেন তুলে নেবে
        const savedToken = localStorage.getItem("token"); 

        const response = await fetch(`http://localhost:5000/api/v1/products/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${savedToken}`, 
                "Content-Type": "application/json",
            },
        });

        const textData = await response.text();
        let data;
        try {
            data = JSON.parse(textData);
        } catch (e) {
            throw new Error("Server did not return valid JSON.");
        }
        
        if (!response.ok) {
            throw new Error(data.message || "Failed to delete product");
        }

        return data;
    } catch (error) {
        throw new Error((error as Error).message);
    }
};