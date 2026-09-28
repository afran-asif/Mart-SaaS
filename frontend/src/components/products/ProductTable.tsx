// src/components/products/ProductTable.tsx
"use client";

import React from "react";
import { Product } from "@/types/product";
import ProductTableRow from "./ProductTableRow";
import { useTranslation } from "@/hooks/useTranslation";

interface ProductTableProps {
    paginatedProducts: Product[];
    filteredCount: number;
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    onEdit: (product: Product) => void;
    onDelete: (id: string, name: string) => void;
    onToggleFeatured?: (id: string) => void;
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
    onToggleFeatured,
    onPageChange,
}: ProductTableProps) {
    const { t } = useTranslation();

    if (filteredCount === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-10 text-center text-gray-500">
                    {t("dashboard.productsPage.noProductsFound")}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Mobile cards — no horizontal scroll */}
            <div className="md:hidden divide-y divide-gray-50">
                {paginatedProducts.map((product) => (
                    <div key={product._id} className="p-4 flex gap-3">
                        {product.images && product.images.length > 0 ? (
                            <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-xl border border-gray-100 shadow-sm shrink-0"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm text-xl shrink-0">
                                📦
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <p className="font-medium text-gray-950 text-sm truncate">{product.name}</p>
                                <span
                                    className={`px-2 py-0.5 rounded-md font-medium text-[11px] shrink-0 ${
                                        product.stock > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                    }`}
                                >
                                    {product.stock}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{product.category || "General"}</p>
                            <p className="font-semibold text-gray-900 text-sm mt-1">৳{Number(product.price).toFixed(2)}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <button
                                    onClick={() => onToggleFeatured?.(product._id)}
                                    title={product.featured ? "Remove from featured" : "Add to featured"}
                                    className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors ${product.featured ? "bg-amber-400 text-white" : "bg-gray-100 text-gray-400"}`}
                                >
                                    ★
                                </button>
                                <button
                                    onClick={() => onEdit(product)}
                                    className="flex-1 px-2.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg"
                                >
                                    {t("dashboard.productsPage.edit")}
                                </button>
                                <button
                                    onClick={() => onDelete(product._id, product.name)}
                                    className="flex-1 px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg"
                                >
                                    {t("dashboard.productsPage.delete")}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs sm:text-sm font-semibold">
                            <th className="p-3 sm:p-4 pl-4 sm:pl-6 w-16 sm:w-20">{t("dashboard.productsPage.image")}</th>
                            <th className="p-3 sm:p-4">{t("dashboard.productsPage.productName")}</th>
                            <th className="p-3 sm:p-4 hidden md:table-cell">{t("dashboard.productsPage.category")}</th>
                            <th className="p-3 sm:p-4 hidden lg:table-cell">{t("dashboard.productsPage.description")}</th>
                            <th className="p-3 sm:p-4">{t("dashboard.productsPage.price")}</th>
                            <th className="p-3 sm:p-4">{t("dashboard.productsPage.stock")}</th>
                            <th className="p-3 sm:p-4 pr-4 sm:pr-6 text-right">{t("dashboard.productsPage.actions")}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-gray-700 text-xs sm:text-sm">
                        {paginatedProducts.map((product) => (
                            <ProductTableRow
                                key={product._id}
                                product={product}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onToggleFeatured={onToggleFeatured}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center p-3 sm:p-4 border-t border-gray-100 gap-3 text-xs font-medium text-gray-500">
                <div>
                    {t("dashboard.productsPage.showing")}{" "}
                    <span className="text-gray-900 font-semibold">
                        {(currentPage - 1) * itemsPerPage + 1}
                    </span>{" "}
                    {t("dashboard.productsPage.to")}{" "}
                    <span className="text-gray-900 font-semibold">
                        {Math.min(currentPage * itemsPerPage, filteredCount)}
                    </span>{" "}
                    {t("dashboard.productsPage.of")}{" "}
                    <span className="text-gray-900 font-semibold">{filteredCount}</span>{" "}
                    {t("dashboard.productsPage.entries")}
                </div>

                <div className="flex items-center gap-1 flex-wrap justify-center">
                    <button
                        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-2.5 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {t("dashboard.productsPage.previous")}
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${
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
                        className="px-2.5 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {t("dashboard.productsPage.next")}
                    </button>
                </div>
            </div>
        </div>
    );
}
