// src/app/dashboard/products/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { getAllProducts, deleteProductApi } from "@/services/productService";
import { Product } from "@/types/product";
import ProductSearchBar from "@/components/products/ProductSearchBar";
import ProductTable from "@/components/products/ProductTable";
import AddProductModal from "@/components/products/AddProductModal";
import EditProductModal from "@/components/products/EditProductModal";

const ITEMS_PER_PAGE = 8;

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Search, Filter & Sort
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortBy, setSortBy] = useState("default");
    const [currentPage, setCurrentPage] = useState(1);

    // Modal visibility
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const fetchProducts = async () => {
        try {
            const data = await getAllProducts();
            setProducts(data.products || data);
        } catch {
            toast.error("Failed to load products. Please refresh.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Reset to page 1 on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory]);

    // Client-side Filter, Search & Sort
    const filteredProducts = useMemo(() => {
        let result = products.filter((p) => {
            const matchesSearch =
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
        else if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
        else if (sortBy === "name-asc") result.sort((a, b) => a.name.localeCompare(b.name));
        else if (sortBy === "stock-low") result.sort((a, b) => a.stock - b.stock);

        return result;
    }, [products, searchTerm, selectedCategory, sortBy]);

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    // Handlers
    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
        const toastId = toast.loading("Deleting product...");
        try {
            await deleteProductApi(id);
            setProducts((prev) => prev.filter((p) => p._id !== id));
            toast.success("Product deleted successfully!", { id: toastId });
        } catch (error: any) {
            toast.error(error.message || "Failed to delete product.", { id: toastId });
        }
    };

    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setIsEditModalOpen(true);
    };

    const handleEditSuccess = (updatedProduct: Product) => {
        setProducts((prev) =>
            prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
        );
    };

    return (
        <div className="space-y-6 relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
                    <p className="text-gray-500 mt-1">Manage and monitor your store items effortlessly.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-sm shrink-0"
                >
                    + Add New Product
                </button>
            </div>

            {/* Search, Filter & Sort */}
            <ProductSearchBar
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                sortBy={sortBy}
                onSearchChange={setSearchTerm}
                onCategoryChange={setSelectedCategory}
                onSortChange={setSortBy}
            />

            {/* Loading State */}
            {loading && <p className="text-gray-600 font-medium p-4">Loading items...</p>}

            {/* Products Table */}
            {!loading && (
                <ProductTable
                    paginatedProducts={paginatedProducts}
                    filteredCount={filteredProducts.length}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onEdit={handleEditClick}
                    onDelete={handleDelete}
                    onPageChange={setCurrentPage}
                />
            )}

            {/* Add Product Modal */}
            <AddProductModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchProducts}
            />

            {/* Edit Product Modal */}
            <EditProductModal
                isOpen={isEditModalOpen}
                product={editingProduct}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingProduct(null);
                }}
                onSuccess={handleEditSuccess}
            />
        </div>
    );
}