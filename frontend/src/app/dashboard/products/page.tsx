// src/app/dashboard/products/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { getAllProducts, createProduct } from "@/services/productService";

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

    // Modal and New Product States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: "",
        price: "",
        stock: "",
        category: "General",
        description: "",
    });
    
    // 🪂 ফাইল স্টোর এবং ড্র্যাগ ট্র্যাকিং স্টেট
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);

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

    // 🎛️ ড্র্যাগ অ্যান্ড ড্রপ ইভেন্ট হ্যান্ডলারসমূহ
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

    // Handle form submit for adding a product (FormData)
    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            // 📤 অবজেক্টের বদলে FormData অবজেক্ট তৈরি করা হলো ফাইল পাঠানোর জন্য
            const formData = new FormData();
            formData.append("name", newProduct.name);
            formData.append("price", newProduct.price);
            formData.append("stock", newProduct.stock);
            formData.append("category", newProduct.category);
            formData.append("description", newProduct.description);

            // ফাইল সিলেক্ট করা থাকলে তা FormData-তে যুক্ত হবে
            if (selectedFile) {
                formData.append("image", selectedFile); 
            }

            await createProduct(formData);
            
            // Form reset and closing modal
            setIsModalOpen(false);
            setNewProduct({ name: "", price: "", stock: "", description: "", category: "General" });
            setSelectedFile(null);
            
            // Refresh the listing table automatically
            fetchProducts();
        } catch (err: any) {
            alert("❌ Failed to add product. Check console or backend logs.");
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="space-y-6 relative">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
                    <p className="text-gray-500 mt-1">Manage and monitor your store items effortlessly.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-sm"
                >
                    + Add New Product
                </button>
            </div>

            {/* Loading/Error States */}
            {loading && <p className="text-gray-600 font-medium">Loading items...</p>}
            {error && <p className="text-red-500 font-medium">{error}</p>}

            {/* Products Table */}
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
            {/* 📸 ইমেজ কলামের জন্য হেডার থিম তৈরি করা হলো */}
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
        {products.map((product) => (
            <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                {/* 🖼️ ১. ক্লাউডিনারি ইমেজ থাম্বনেইল দেখানোর কলাম */}
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

                            {/* Action Buttons */}
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
        </div>
    );
}