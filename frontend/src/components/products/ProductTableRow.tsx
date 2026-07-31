// src/components/products/ProductTableRow.tsx
"use client";

import React from "react";
import { Product } from "@/types/product";

interface ProductTableRowProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (id: string, name: string) => void;
}

export default function ProductTableRow({ product, onEdit, onDelete }: ProductTableRowProps) {
    return (
        <tr className="hover:bg-gray-50/50 transition-colors">
            {/* Image */}
            <td className="p-4 pl-6">
                {product.images && product.images.length > 0 ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-xl border border-gray-100 shadow-sm"
                    />
                ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm">
                        📦
                    </div>
                )}
            </td>

            {/* Name */}
            <td className="p-4 font-medium text-gray-950">{product.name}</td>

            {/* Category */}
            <td className="p-4">{product.category || "General"}</td>

            {/* Description */}
            <td className="p-4 truncate max-w-[150px]">{product.description}</td>

            {/* Price */}
            <td className="p-4">${Number(product.price).toFixed(2)}</td>

            {/* Stock */}
            <td className="p-4">
                <span
                    className={`px-2 py-1 rounded-md font-medium text-xs ${
                        product.stock > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}
                >
                    {product.stock} left
                </span>
            </td>

            {/* Actions */}
            <td className="p-4 pr-6 text-right space-x-2">
                <button
                    onClick={() => onEdit(product)}
                    className="text-blue-600 hover:underline font-medium transition-colors hover:text-blue-800"
                >
                    Edit
                </button>
                <button
                    onClick={() => onDelete(product._id, product.name)}
                    className="text-red-600 hover:underline font-medium transition-colors hover:text-red-800"
                >
                    Delete
                </button>
            </td>
        </tr>
    );
}
