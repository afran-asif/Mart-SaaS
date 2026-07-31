// src/components/products/ImageUploader.tsx
"use client";

import React, { useRef } from "react";
import toast from "react-hot-toast";

interface ImageUploaderProps {
    selectedFiles: File[];
    imagePreviews: string[];
    maxImages?: number;
    onFilesAdd: (files: File[], previews: string[]) => void;
    onRemove: (index: number) => void;
    onClearAll: () => void;
}

export default function ImageUploader({
    selectedFiles,
    imagePreviews,
    maxImages = 5,
    onFilesAdd,
    onRemove,
    onClearAll,
}: ImageUploaderProps) {
    const [isDragging, setIsDragging] = React.useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const validateAndAddFiles = (files: File[]) => {
        const remaining = maxImages - selectedFiles.length;
        if (remaining <= 0) {
            toast.error(`Maximum ${maxImages} images allowed.`);
            return;
        }

        const validFiles: File[] = [];
        const newPreviews: string[] = [];

        for (const file of files.slice(0, remaining)) {
            if (!file.type.startsWith("image/")) {
                toast.error(`"${file.name}" is not a valid image.`);
                continue;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`"${file.name}" exceeds 5MB limit.`);
                continue;
            }
            validFiles.push(file);
            newPreviews.push(URL.createObjectURL(file));
        }

        if (validFiles.length > 0) {
            onFilesAdd(validFiles, newPreviews);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndAddFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndAddFiles(Array.from(e.target.files));
        }
        // Reset so same file can be re-added after removal
        e.target.value = "";
    };

    return (
        <div>
            {/* Header row */}
            <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Product Images
                </label>
                <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        selectedFiles.length >= maxImages
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-500"
                    }`}
                >
                    {selectedFiles.length}/{maxImages}
                </span>
            </div>

            {/* Image Previews Grid */}
            {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                    {imagePreviews.map((preview, index) => (
                        <div
                            key={index}
                            className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-square shadow-sm"
                        >
                            <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {/* Hover overlay with remove button */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => onRemove(index)}
                                    className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors shadow"
                                    title="Remove image"
                                >
                                    ✕
                                </button>
                            </div>
                            {/* Main badge */}
                            {index === 0 && (
                                <span className="absolute top-1 left-1 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md leading-none">
                                    MAIN
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Dropzone — hidden when limit reached */}
            {selectedFiles.length < maxImages && (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                        isDragging
                            ? "border-orange-500 bg-orange-50/50"
                            : "border-gray-200 hover:border-orange-400"
                    }`}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <div className="text-xs text-gray-500 space-y-1">
                        <p className="text-2xl mb-1">🖼️</p>
                        <p className="font-semibold text-gray-700 text-sm">Drag & Drop images here</p>
                        <p>
                            or <span className="text-orange-500 underline">browse</span> computer
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                            Up to {maxImages} images · Max 5MB each
                        </p>
                    </div>
                </div>
            )}

            {/* Clear all button */}
            {selectedFiles.length > 1 && (
                <button
                    type="button"
                    onClick={onClearAll}
                    className="mt-2 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                >
                    ✕ Clear all images
                </button>
            )}
        </div>
    );
}
