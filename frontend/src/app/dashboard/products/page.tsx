// src/app/dashboard/products/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { getAllProducts, createProduct, deleteProductApi, updateProductApi } from "@/services/productService";

interface Product {
    _id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    description: string;
    images: string[];
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // 🔍 Search, Filter & Pagination States
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // ➕ Add Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: "",
        price: "",
        stock: "",
        category: "General",
        description: "",
    });
    
    // 🪂 File & Drag Tracking States
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // ✏️ Edit Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editForm, setEditForm] = useState({
        name: "",
        price: "",
        stock: "",
        category: "",
        description: "",
    });

    // Fetch products from backend
    const fetchProducts = async () => {
        try {
            const data = await getAllProducts();
            setProducts(data.products || data);
        } catch (err: any) {
            setError("❌ Failed to load products. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // 🔍 Client-side Filter & Search Logic
    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchTerm, selectedCategory]);

    // 📄 Pagination Calculation
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(start, start + itemsPerPage);
    }, [filteredProducts, currentPage, itemsPerPage]);

    // Reset pagination to page 1 when search or category changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory]);

    // 🎛️ Drag & Drop Event Handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    // Handle form submit for adding a product
    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", newProduct.name);
            formData.append("price", newProduct.price);
            formData.append("stock", newProduct.stock);
            formData.append("category", newProduct.category);
            formData.append("description", newProduct.description);

            if (selectedFile) {
                formData.append("image", selectedFile); 
            }

            await createProduct(formData);
            
            setIsModalOpen(false);
            setNewProduct({ name: "", price: "", stock: "", description: "", category: "General" });
            setSelectedFile(null);
            
            fetchProducts();
        } catch (err: any) {
            alert("❌ Failed to add product. Check console or backend logs.");
        } finally {
            setFormLoading(false);
        }
    };
    
    // Delete product handler
    const handleDelete = async (id: string, name: string) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete "${name}"?`);
        if (!confirmDelete) return;

        try {
            await deleteProductApi(id);
            setProducts((prevProducts) => prevProducts.filter((product) => product._id !== id));
            alert("Product deleted successfully!");
        } catch (error) {
            alert("Error deleting product: " + (error as Error).message);
        }
    };

    // Edit button click
    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setEditForm({
            name: product.name,
            price: String(product.price),
            stock: String(product.stock),
            category: product.category || "General",
            description: product.description,
        });
        setIsEditModalOpen(true);
    };

    // Edit form submit
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;
        setEditLoading(true);

        try {
            const updatedData = {
                name: editForm.name,
                price: Number(editForm.price),
                stock: Number(editForm.stock),
                category: editForm.category,
                description: editForm.description,
            };

            const result = await updateProductApi(editingProduct._id, updatedData);

            setProducts((prev) =>
                prev.map((p) => (p._id === editingProduct._id ? { ...p, ...result.product } : p))
            );

            setIsEditModalOpen(false);
            setEditingProduct(null);
            alert("✅ Product updated successfully!");
        } catch (error) {
            alert("❌ Failed to update product: " + (error as Error).message);
        } finally {
            setEditLoading(false);
        }
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
                    onClick={() => setIsModalOpen(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-sm shrink-0"
                >
                    + Add New Product
                </button>
            </div>

            {/* 🔍 Search Input & Category Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-full sm:w-1/2 relative">
                    <input
                        type="text"
                        placeholder="Search products by name or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm text-gray-900"
                    />
                    <span className="absolute left-3.5 top-3 text-gray-400">🔍</span>
                </div>

                <div className="w-full sm:w-auto flex items-center gap-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0">Filter:</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-orange-500 transition-colors text-sm text-gray-900"
                    >
                        <option value="All">All Categories</option>
                        <option value="Clothing">Clothing</option>
                        <option value="Gadgets">Gadgets</option>
                        <option value="Accessories">Accessories</option>
                        <option value="General">General</option>
                    </select>
                </div>
            </div>

            {/* Loading/Error States */}
            {loading && <p className="text-gray-600 font-medium p-4">Loading items...</p>}
            {error && <p className="text-red-500 font-medium p-4">{error}</p>}

            {/* Products Table */}
            {!loading && !error && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {filteredProducts.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">
                            No products found matching your criteria.
                        </div>
                    ) : (
                        <>
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
                                        <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
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

                                            <td className="p-4 font-medium text-gray-950">{product.name}</td>
                                            <td className="p-4">{product.category || "General"}</td>
                                            <td className="p-4 truncate max-w-[150px]">{product.description}</td>
                                            <td className="p-4">${product.price.toFixed(2)}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-md font-medium text-xs ${product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                    {product.stock} left
                                                </span>
                                            </td>
                                            <td className="p-4 pr-6 text-right space-x-2">
                                                <button 
                                                    onClick={() => handleEditClick(product)}
                                                    className="text-blue-600 hover:underline font-medium transition-colors hover:text-blue-800"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(product._id, product.name)}
                                                    className="text-red-600 hover:underline font-medium transition-colors hover:text-red-800"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* 📄 Pagination Bar Control */}
                            <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-100 gap-4 text-xs font-medium text-gray-500">
                                <div>
                                    Showing <span className="text-gray-900 font-semibold">{((currentPage - 1) * itemsPerPage) + 1}</span> to{" "}
                                    <span className="text-gray-900 font-semibold">
                                        {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
                                    </span> of{" "}
                                    <span className="text-gray-900 font-semibold">{filteredProducts.length}</span> entries
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
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
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ADD PRODUCT POPUP MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Product 🛒</h2>
                        <p className="text-sm text-gray-500 mb-6">Fill in the details below to add a product to your current store.</p>
                        
                        <form onSubmit={handleAddProduct} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Product Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                                    placeholder="e.g., Luxury Black Hoodie" 
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm text-gray-900"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Price ($)</label>
                                    <input 
                                        type="number" 
                                        required
                                        value={newProduct.price}
                                        onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                                        placeholder="29.99" 
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Stock Qty</label>
                                    <input 
                                        type="number" 
                                        required
                                        value={newProduct.stock}
                                        onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                                        placeholder="50" 
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm text-gray-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Description</label>
                                <textarea 
                                    required
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                                    placeholder="Enter product description..." 
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm text-gray-900 resize-none"
                                />
                            </div>

                            {/* 🪂 Drag & Drop Image Box */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Product Image</label>
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                                        isDragging ? "border-orange-500 bg-orange-50/50" : "border-gray-200 hover:border-orange-400"
                                    }`}
                                    onClick={() => document.getElementById("fileInput")?.click()}
                                >
                                    <input
                                        id="fileInput"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    {selectedFile ? (
                                        <div className="text-sm text-gray-800 flex items-center justify-center gap-2">
                                            <span>📸</span>
                                            <span className="font-semibold text-orange-600 truncate max-w-[200px]">{selectedFile.name}</span>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-gray-500 space-y-1">
                                            <p className="font-semibold text-gray-700 text-sm">Drag & Drop image here</p>
                                            <p>or <span className="text-orange-500 underline">browse</span> computer</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Category</label>
                                <select 
                                    value={newProduct.category}
                                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-orange-500 transition-colors text-sm text-gray-900"
                                >
                                    <option value="Clothing">Clothing</option>
                                    <option value="Gadgets">Gadgets</option>
                                    <option value="Accessories">Accessories</option>
                                    <option value="General">General</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setSelectedFile(null);
                                    }}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={formLoading}
                                    className="px-5 py-2.5 text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-colors shadow-sm disabled:bg-gray-400"
                                >
                                    {formLoading ? "Saving..." : "Add Product"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT PRODUCT POPUP MODAL */}
            {isEditModalOpen && editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-bold text-gray-900">Edit Product ✏️</h2>
                            <button
                                onClick={() => { setIsEditModalOpen(false); setEditingProduct(null); }}
                                className="text-gray-400 hover:text-gray-700 text-2xl leading-none transition-colors"
                            >
                                ×
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">
                            Update the details for <span className="font-semibold text-gray-800">{editingProduct.name}</span>.
                        </p>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Product Name</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm text-gray-900"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Price ($)</label>
                                    <input
                                        type="number"
                                        required
                                        value={editForm.price}
                                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Stock Qty</label>
                                    <input
                                        type="number"
                                        required
                                        value={editForm.stock}
                                        onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm text-gray-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    required
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm text-gray-900 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Category</label>
                                <select
                                    value={editForm.category}
                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 transition-colors text-sm text-gray-900"
                                >
                                    <option value="Clothing">Clothing</option>
                                    <option value="Gadgets">Gadgets</option>
                                    <option value="Accessories">Accessories</option>
                                    <option value="General">General</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                                <button
                                    type="button"
                                    onClick={() => { setIsEditModalOpen(false); setEditingProduct(null); }}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editLoading}
                                    className="px-5 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-sm disabled:bg-gray-400"
                                >
                                    {editLoading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}