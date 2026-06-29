import axios from "axios";


const API_URL = "http://localhost:5000/api/v1/products";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        withCredentials: true,
    };
};

export const getAllProducts = async () => {
    const response = await axios.get(`${API_URL}`, getAuthHeaders());
    return response.data;
}

export const createProduct = async (productData: any) => {
    const response = await axios.post(`${API_URL}/add`, productData, getAuthHeaders());
    return response.data;
};