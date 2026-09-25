import { api } from "./api";

export interface Category {
    _id: string;
    name: string;
    createdAt?: string;
    productCount?: number;
}

export const getCategories = async (): Promise<Category[]> => {
    const response = await api.get("/categories");
    return response.data.categories || [];
};

export const createCategory = async (name: string) => {
    return api.post("/categories", { name });
};

export const updateCategory = async (id: string, name: string) => {
    return api.put(`/categories/${id}`, { name });
};

export const deleteCategory = async (id: string) => {
    return api.delete(`/categories/${id}`);
};