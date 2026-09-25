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
            {/* Table with horizontal scroll */}
            <div className="overflow-x-auto">
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
