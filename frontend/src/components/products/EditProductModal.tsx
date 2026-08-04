// src/components/products/EditProductModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { updateProductApi } from "@/services/productService";
import { Product } from "@/types/product";
import ImageUploader from "./ImageUploader";

interface EditProductModalProps {
    isOpen: boolean;
    product: Product | null;
    onClose: () => void;
    onSuccess: (updatedProduct: Product) => void;
}

const MAX_IMAGES = 5;

export default function EditProductModal({
    isOpen,
    product,
    onClose,
    onSuccess,
}: EditProductModalProps) {
    const [editLoading, setEditLoading] = useState(false);
    const [editForm, setEditForm] = useState({
        name: "",
        price: "",
        stock: "",
        category: "General",
        description: "",
    });

    // Existing remote images and newly selected files
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [newPreviews, setNewPreviews] = useState<string[]>([]);

    // Revoke blob URLs helper
    const cleanupBlobUrls = (previews: string[]) => {
        previews.forEach((url) => URL.revokeObjectURL(url));
    };

    // Populate form and images whenever the target product changes
    useEffect(() => {
        if (product) {
            setEditForm({
                name: product.name,
                price: String(product.price),
                stock: String(product.stock),
                category: product.category || "General",
                description: product.description,
            });

            // Initialize existing images array from product
            const currentImages = product.images && product.images.length > 0
                ? product.images
                : (product.image ? [product.image] : []);
            setExistingImages(currentImages);

            // Reset new files
            cleanupBlobUrls(newPreviews);
            setNewFiles([]);
            setNewPreviews([]);
        }
    }, [product]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            cleanupBlobUrls(newPreviews);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFilesAdd = (addedFiles: File[], addedPreviews: string[]) => {
        setNewFiles((prev) => [...prev, ...addedFiles]);
        setNewPreviews((prev) => [...prev, ...addedPreviews]);
    };

    const handleRemoveImage = (index: number) => {
        if (index < existingImages.length) {
            // Remove from existing remote images
            setExistingImages((prev) => prev.filter((_, i) => i !== index));
        } else {
            // Remove from new local files
            const newIndex = index - existingImages.length;
            URL.revokeObjectURL(newPreviews[newIndex]);
            setNewFiles((prev) => prev.filter((_, i) => i !== newIndex));
            setNewPreviews((prev) => prev.filter((_, i) => i !== newIndex));
        }
    };

    const handleClearAllImages = () => {
        setExistingImages([]);
        cleanupBlobUrls(newPreviews);
        setNewFiles([]);
        setNewPreviews([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;

        if (!editForm.name.trim()) return toast.error("Product name is required.");
        if (Number(editForm.price) <= 0) return toast.error("Price must be greater than 0.");
        if (Number(editForm.stock) < 0) return toast.error("Stock cannot be negative.");

        setEditLoading(true);
        const toastId = toast.loading("Updating product...");

        try {
            const formData = new FormData();
            formData.append("name", editForm.name.trim());
            formData.append("price", editForm.price);
            formData.append("stock", editForm.stock);
            formData.append("category", editForm.category);
            formData.append("description", editForm.description.trim());
            formData.append("existingImages", JSON.stringify(existingImages));

            newFiles.forEach((file) => {
                formData.append("images", file);
            });

            const result = await updateProductApi(product._id, formData);

            toast.success("Product updated successfully!", { id: toastId });
            onSuccess({ ...product, ...result.product });
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to update product.", { id: toastId });
        } finally {
            setEditLoading(false);
        }
    };

    if (!isOpen || !product) return null;

    const combinedPreviews = [...existingImages, ...newPreviews];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Product ✏️</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 text-2xl leading-none transition-colors"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {/* Product Name */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                            Product Name
                        </label>
                        <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm text-gray-900"
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
                                value={editForm.price}
                                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                Stock Qty
                            </label>
                            <input
                                type="number"
                                value={editForm.stock}
                                onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm text-gray-900"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                            Description
                        </label>
                        <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm text-gray-900 resize-none"
                        />
                    </div>

                    {/* Image Uploader */}
                    <ImageUploader
                        selectedFiles={newFiles}
                        imagePreviews={combinedPreviews}
                        existingImagesCount={existingImages.length}
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
                            disabled={editLoading}
                            className="px-5 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-sm disabled:bg-gray-400"
                        >
                            {editLoading ? "Updating..." : "Update Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
