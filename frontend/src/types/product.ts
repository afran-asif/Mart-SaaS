// src/types/product.ts

export interface Product {
    _id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    description: string;
    images: string[];
    image?: string;
}
