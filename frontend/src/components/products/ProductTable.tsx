// src/components/products/ProductTable.tsx
"use client";

import React from "react";
import { Product } from "@/types/product";
import ProductTableRow from "./ProductTableRow";

interface ProductTableProps {
    paginatedProducts: Product[];
    filteredCount: number;
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    onEdit: (product: Product) => void;
    onDelete: (id: string, name: string) => void;
    onPageChange: (page: number) => void;
}

export default function ProductTable({
    paginatedProducts,
    filteredCount,
    currentPage,
    totalPages,
    itemsPerPage,
    onEdit,
    onDelete,
    onPageChange,
}: ProductTableProps) {
    if (filteredCount === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-10 text-center text-gray-500">
                    No products found matching your criteria.
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm font-semibold">
                            <th className="p-4 pl-6 w-20">Image</th>
                            <th className="p-4">Product Name</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Description</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Stock</th>
                            <th className="p-4 pr-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-gray-700 text-sm">
                        {paginatedProducts.map((product) => (
                            <ProductTableRow
                                key={product._id}
                                product={product}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-100 gap-4 text-xs font-medium text-gray-500">
                <div>
                    Showing{" "}
                    <span className="text-gray-900 font-semibold">
                        {(currentPage - 1) * itemsPerPage + 1}
                    </span>{" "}
                    to{" "}
                    <span className="text-gray-900 font-semibold">
                        {Math.min(currentPage * itemsPerPage, filteredCount)}
                    </span>{" "}
                    of <span className="text-gray-900 font-semibold">{filteredCount}</span> entries
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                                currentPage === page
                                    ? "bg-orange-600 text-white"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
