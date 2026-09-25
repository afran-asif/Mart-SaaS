// src/components/products/ProductTableRow.tsx
"use client";

import React from "react";
import { Product } from "@/types/product";

interface ProductTableRowProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (id: string, name: string) => void;
    onToggleFeatured?: (id: string) => void;
}

export default function ProductTableRow({ product, onEdit, onDelete, onToggleFeatured }: ProductTableRowProps) {
    return (
        <tr className="hover:bg-gray-50/50 transition-colors">
            {/* Image */}
            <td className="p-3 sm:p-4 pl-4 sm:pl-6">
                {product.images && product.images.length > 0 ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-xl border border-gray-100 shadow-sm"
                    />
                ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm text-sm">
                        📦
                    </div>
                )}
            </td>

            {/* Name */}
            <td className="p-3 sm:p-4 font-medium text-gray-950 text-xs sm:text-sm max-w-[120px] sm:max-w-none">
                <span className="truncate block">{product.name}</span>
            </td>

            {/* Category - hidden on small screens */}
            <td className="p-3 sm:p-4 text-xs sm:text-sm hidden md:table-cell">{product.category || "General"}</td>

            {/* Description - hidden on small/medium screens */}
            <td className="p-3 sm:p-4 truncate max-w-[150px] text-xs sm:text-sm hidden lg:table-cell">{product.description}</td>

            {/* Price */}
            <td className="p-3 sm:p-4 text-xs sm:text-sm whitespace-nowrap">৳{Number(product.price).toFixed(2)}</td>

            {/* Stock */}
            <td className="p-3 sm:p-4">
                <span
                    className={`px-1.5 sm:px-2 py-1 rounded-md font-medium text-[10px] sm:text-xs ${
                        product.stock > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}
                >
                    {product.stock}
                </span>
            </td>

            {/* Actions */}
            <td className="p-3 sm:p-4 pr-4 sm:pr-6 text-right">
                <div className="flex items-center justify-end gap-1 sm:gap-2">
                    <button
                        onClick={() => onToggleFeatured?.(product._id)}
                        title={product.featured ? "Remove from featured" : "Add to featured"}
                        className={`text-xs font-bold px-2 py-1 rounded-lg transition-colors ${product.featured ? "bg-amber-400 text-white" : "bg-gray-100 text-gray-400 hover:bg-amber-50 hover:text-amber-600"}`}
                    >
                        ★
                    </button>
                    <button
                        onClick={() => onEdit(product)}
                        className="text-blue-600 hover:underline font-medium transition-colors hover:text-blue-800 text-xs"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(product._id, product.name)}
                        className="text-red-600 hover:underline font-medium transition-colors hover:text-red-800 text-xs"
                    >
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    );
}
