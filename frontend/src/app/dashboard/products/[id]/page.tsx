// src/app/dashboard/products/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getAllProducts, Product } from "@/services/productService";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getAllProducts();
        const productList: Product[] = Array.isArray(data) ? data : data.products || [];
        const found = productList.find((p) => p._id === productId);
        if (found) {
          setProduct(found);
          const primaryImg =
            found.images && found.images.length > 0
              ? found.images[0]
              : found.image || "/placeholder.png";
          setSelectedImage(primaryImg);
        }
      } catch {
        toast.error("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

  const handleQuantityChange = (type: "inc" | "dec") => {
    if (type === "dec" && quantity > 1) setQuantity((prev) => prev - 1);
    if (type === "inc" && product?.stock && quantity < product.stock)
      setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = () => {
    if (!product) return;
    toast.success(`${quantity}× ${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-400">
        <p className="text-5xl">📦</p>
        <p className="text-lg font-semibold text-gray-600">Product not found</p>
        <button
          onClick={() => router.back()}
          className="mt-2 px-5 py-2 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  const allImages =
    product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : ["/placeholder.png"];

  const inStock = product.stock && product.stock > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
        <button onClick={() => router.push("/dashboard/products")} className="hover:text-orange-500 transition-colors">
          My Products
        </button>
        <span>/</span>
        <span className="text-gray-700 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

        {/* ─── Left: Image Gallery ─── */}
        <div className="p-8 space-y-4 bg-gray-50/60">
          {/* Main Image */}
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
            <img
              src={selectedImage || allImages[0]}
              alt={product.name}
              className="w-full h-full object-contain p-6 transition-all duration-300"
            />
            {/* Stock badge */}
            {!inStock && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {allImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 transition-all border-2 ${
                    selectedImage === imgUrl
                      ? "border-orange-500 shadow-md shadow-orange-200 scale-105"
                      : "border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-300"
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── Right: Product Details ─── */}
        <div className="p-8 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Category pill */}
            <span className="inline-block px-3 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded-full uppercase tracking-widest">
              {product.category || "General"}
            </span>

            {/* Name */}
            <h1 className="text-3xl font-extrabold text-gray-900 leading-snug">
              {product.name}
            </h1>

            {/* Price + Stock */}
            <div className="flex items-center gap-4">
              <p className="text-4xl font-black text-orange-500">
                ${Number(product.price || 0).toFixed(2)}
              </p>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                  inStock
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {inStock ? `${product.stock} in stock` : "Out of Stock"}
              </span>
            </div>

            {/* Divider */}
            <hr className="border-gray-100" />

            {/* Description */}
            <p className="text-gray-500 text-sm leading-7">
              {product.description || "No description provided for this product."}
            </p>
          </div>

          {/* ─── Actions ─── */}
          <div className="mt-8 space-y-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-5">
              <span className="text-sm font-semibold text-gray-700">Quantity</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => handleQuantityChange("dec")}
                  disabled={quantity <= 1}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 font-bold text-lg disabled:opacity-30 transition-colors"
                >
                  −
                </button>
                <span className="px-5 py-2 font-bold text-gray-900 text-base bg-white border-x border-gray-200">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange("inc")}
                  disabled={!inStock || quantity >= (product.stock || 0)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 font-bold text-lg disabled:opacity-30 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none text-base"
            >
              {inStock ? `🛒 Add to Cart — $${(Number(product.price || 0) * quantity).toFixed(2)}` : "Currently Unavailable"}
            </button>

            {/* Back button */}
            <button
              onClick={() => router.back()}
              className="w-full py-3 rounded-2xl border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              ← Back to Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}