"use client";

import React, { useState, useEffect } from "react";
import { getAllProducts } from "@/services/productService";

interface Product {
    _id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getAllProducts();
                setProducts(data.products || data);
            } catch (err: any) {
                setError("Failed to load products. Please try again.")
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
            <div className="space-y-6">
        {/*Product add button*/}
        <div className="flex justify-between items-center">
            <div>
            <h1 className="text-3xl font-bold text-gray-900">My Products 📦</h1>
            <p className="text-gray-500 mt-1">Manage and monitor your store items effortlessly.</p>
            </div>
            <button className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-sm">
            + Add New Product
            </button>
        </div>

        {/* error & loading state */}
        {loading && <p className="text-gray-600 font-medium">Loading items...</p>}
        {error && <p className="text-red-500 font-medium">{error}</p>}

        {/* Products table */}
        {!loading && !error && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {products.length === 0 ? (
                <div className="p-10 text-center text-gray-500">
                No products found. Click "+ Add New Product" to stock your store!
                </div>
            ) : (
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm font-semibold">
                    <th className="p-4 pl-6">Product Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-700 text-sm">
                    {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 pl-6 font-medium text-gray-950">{product.name}</td>
                        <td className="p-4">{product.category || "General"}</td>
                        <td className="p-4">${product.price.toFixed(2)}</td>
                        <td className="p-4">
                        <span className={`px-2 py-1 rounded-md font-medium text-xs ${product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {product.stock} left
                        </span>
                        </td>
                        <td className="p-4 pr-6 text-right space-x-2">
                        <button className="text-blue-600 hover:underline font-medium">Edit</button>
                        <button className="text-red-600 hover:underline font-medium">Delete</button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            )}
            </div>
        )}
        </div>
    )
}