// src/components/products/ProductSearchBar.tsx
"use client";

import React from "react";

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
    return (
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            {/* Search Input */}
            <div className="w-full lg:w-1/2 relative">
                <input
                    type="text"
                    placeholder="Search products by name or description..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm text-gray-900"
                />
                <span className="absolute left-3.5 top-3 text-gray-400">🔍</span>
            </div>

            {/* Filters & Sorting */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
                {/* Category Filter */}
                <div className="w-full sm:w-auto flex items-center gap-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0">
                        Filter:
                    </label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => onCategoryChange(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-orange-500 transition-colors text-sm text-gray-900"
                    >
                        <option value="All">All Categories</option>
                        <option value="Clothing">Clothing</option>
                        <option value="Gadgets">Gadgets</option>
                        <option value="Accessories">Accessories</option>
                        <option value="General">General</option>
                    </select>
                </div>

                {/* Sort Control */}
                <div className="w-full sm:w-auto flex items-center gap-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0">
                        Sort:
                    </label>
                    <select
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-orange-500 transition-colors text-sm text-gray-900"
                    >
                        <option value="default">Default</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="name-asc">Name: A to Z</option>
                        <option value="stock-low">Stock: Low to High</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
