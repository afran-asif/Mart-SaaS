// src/components/products/AddProductModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { createProduct } from "@/services/productService";
import ImageUploader from "./ImageUploader";

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const INITIAL_FORM = {
    name: "",
    price: "",
    stock: "",
    category: "General",
    description: "",
};

const MAX_IMAGES = 5;

export default function AddProductModal({ isOpen, onClose, onSuccess }: AddProductModalProps) {
    const [formLoading, setFormLoading] = useState(false);
    const [form, setForm] = useState(INITIAL_FORM);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // Clean up object URLs when modal unmounts or closes
    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    useEffect(() => {
        return () => {
            imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const resetForm = () => {
        imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        setForm(INITIAL_FORM);
        setSelectedFiles([]);
        setImagePreviews([]);
    };

    const handleFilesAdd = (newFiles: File[], newPreviews: string[]) => {
        setSelectedFiles((prev) => [...prev, ...newFiles]);
        setImagePreviews((prev) => [...prev, ...newPreviews]);
    };

    const handleRemoveImage = (index: number) => {
        URL.revokeObjectURL(imagePreviews[index]);
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleClearAllImages = () => {
        imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        setSelectedFiles([]);
        setImagePreviews([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name.trim()) return toast.error("Product name is required.");
        if (Number(form.price) <= 0) return toast.error("Price must be greater than 0.");
        if (Number(form.stock) < 0) return toast.error("Stock cannot be negative.");

        setFormLoading(true);
        const toastId = toast.loading("Adding product...");

        try {
            const formData = new FormData();
            formData.append("name", form.name.trim());
            formData.append("price", form.price);
            formData.append("stock", form.stock);
            formData.append("category", form.category);
            formData.append("description", form.description.trim());
            selectedFiles.forEach((file) => formData.append("images", file));

            await createProduct(formData);

            toast.success("Product added successfully!", { id: toastId });
            onClose();
            onSuccess();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to add product.", { id: toastId });
        } finally {
            setFormLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Product 🛒</h2>
                <p className="text-sm text-gray-500 mb-6">Fill in the details below to add a product.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Product Name */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                            Product Name
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g., SESTONE Oversized Hoodie"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm text-gray-900"
                        />
                    </div>

                    {/* Price & Stock */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                Price ($)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                placeholder="29.99"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                Stock Qty
                            </label>
                            <input
                                type="number"
                                value={form.stock}
                                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                                placeholder="50"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm text-gray-900"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                            Description
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Enter product description..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm text-gray-900 resize-none"
                        />
                    </div>

                    {/* Image Uploader */}
                    <ImageUploader
                        selectedFiles={selectedFiles}
                        imagePreviews={imagePreviews}
                        maxImages={MAX_IMAGES}
                        onFilesAdd={handleFilesAdd}
                        onRemove={handleRemoveImage}
                        onClearAll={handleClearAllImages}
                    />

                    {/* Category */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                            Category
                        </label>
                        <select
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-orange-500 transition-colors text-sm text-gray-900"
                        >
                            <option value="Clothing">Clothing</option>
                            <option value="Gadgets">Gadgets</option>
                            <option value="Accessories">Accessories</option>
                            <option value="General">General</option>
                        </select>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
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
    );
}
