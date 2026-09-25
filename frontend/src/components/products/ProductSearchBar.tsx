// src/components/products/ProductSearchBar.tsx
"use client";

import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useCategories } from "@/hooks/useCategories";

interface ProductSearchBarProps {
    searchTerm: string;
    selectedCategory: string;
    sortBy: string;
    onSearchChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onSortChange: (value: string) => void;
}

export default function ProductSearchBar({
    searchTerm,
    selectedCategory,
    sortBy,
    onSearchChange,
    onCategoryChange,
    onSortChange,
}: ProductSearchBarProps) {
    const { t } = useTranslation();
    const { categories } = useCategories();

    return (
        <div className="flex flex-col gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            {/* Search Input */}
            <div className="w-full relative">
                <input
                    type="text"
                    placeholder={t("dashboard.productsPage.searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm text-gray-900"
                />
                <span className="absolute left-3 top-3 text-gray-400 text-sm">🔍</span>
            </div>

            {/* Filters & Sorting */}
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3">
                {/* Category Filter */}
                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0 hidden sm:block">
                        {t("dashboard.productsPage.filter")}
                    </label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => onCategoryChange(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-orange-500 transition-colors text-sm text-gray-900"
                    >
                        <option value="All">{t("dashboard.productsPage.allCategories")}</option>
                        <option value="General">General</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {/* Sort Control */}
                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0 hidden sm:block">
                        {t("dashboard.productsPage.sort")}
                    </label>
                    <select
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-orange-500 transition-colors text-sm text-gray-900"
                    >
                        <option value="default">{t("dashboard.productsPage.sortDefault")}</option>
                        <option value="price-low">{t("dashboard.productsPage.sortPriceLow")}</option>
                        <option value="price-high">{t("dashboard.productsPage.sortPriceHigh")}</option>
                        <option value="name-asc">{t("dashboard.productsPage.sortNameAsc")}</option>
                        <option value="stock-low">{t("dashboard.productsPage.sortStockLow")}</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
