"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { addToCart, setBuyNow } from "@/redux/cartSlice";
import { trackAddToCart } from "@/lib/tracking";
import toast from "react-hot-toast";

interface Product {
    _id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
}

export default function AddToCartButton({ product, theme = "classic", sizes = [] }: { product: Product; theme?: string; sizes?: string[] }) {
    const dispatch = useDispatch();
    const router = useRouter();
    const outOfStock = product.stock === 0;
    const isLuxe = theme === "luxe";
    const isDark = theme === "bold" || theme === "luxe";
    const hasSizes = sizes.length > 0;
    const [size, setSize] = useState<string>("");

    const requireSize = () => {
        if (hasSizes && !size) {
            toast.error("আগে সাইজ বাছুন");
            return false;
        }
        return true;
    };

    const handleAddToCart = () => {
        if (!requireSize()) return;
        dispatch(addToCart({ product, quantity: 1, size }));
        trackAddToCart({ id: product._id, name: product.name, price: product.price }, 1);
        toast.success(`${product.name} কার্টে যোগ হয়েছে${size ? ` (${size})` : ""}`);
    };

    const handleBuyNow = () => {
        if (!requireSize()) return;
        dispatch(setBuyNow({ ...product, size }));
        trackAddToCart({ id: product._id, name: product.name, price: product.price }, 1);
        router.push("/checkout");
    };

    return (
        <div className="flex flex-col gap-3">
            {hasSizes && (
                <div>
                    <p className={`text-xs font-semibold mb-2 uppercase tracking-wider ${isDark ? "text-white/60" : "text-[#75705F]"}`}>
                        Size
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {sizes.map((s) => {
                            const active = size === s;
                            return (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setSize(active ? "" : s)}
                                    className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all active:scale-95 ${
                                        active
                                            ? isDark
                                                ? "bg-white text-black border-white"
                                                : "bg-[#181410] text-white border-[#181410]"
                                            : isDark
                                            ? "bg-white/5 text-white/70 border-white/20 hover:border-white/50"
                                            : "bg-white text-[#181410]/70 border-[#181410]/15 hover:border-[#181410]/40"
                                    }`}
                                >
                                    {s}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
            <button
                onClick={handleBuyNow}
                disabled={outOfStock || (hasSizes && !size)}
            className={`w-full py-3.5 rounded-xl font-medium text-sm transition-all ${
                outOfStock
                    ? "bg-[#75705F]/15 text-[#75705F] cursor-not-allowed"
                    : hasSizes && !size
                    ? "bg-[#F4501A]/60 text-white cursor-not-allowed"
                    : "bg-[#F4501A] text-white hover:bg-[#D63F0F] shadow-lg shadow-[#F4501A]/25 hover:shadow-xl hover:shadow-[#F4501A]/30"
            }`}
            >
                {outOfStock ? "স্টক নেই" : hasSizes && !size ? "সাইজ বাছুন" : "এখনই কিনুন"}
            </button>
            <button
                onClick={handleAddToCart}
                disabled={outOfStock || (hasSizes && !size)}
            className={`w-full py-3.5 rounded-xl font-medium text-sm transition-all border-2 ${
                outOfStock
                    ? "border-[#75705F]/20 text-[#75705F] cursor-not-allowed"
                    : hasSizes && !size
                    ? isDark
                        ? "border-white/30 text-white/40 cursor-not-allowed"
                        : "border-[#181410]/20 text-[#181410]/40 cursor-not-allowed"
                    : isLuxe
                    ? "border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black"
                    : isDark
                    ? "border-white text-white hover:bg-white hover:text-black"
                    : "border-[#0E3B2C] text-[#0E3B2C] hover:bg-[#0E3B2C] hover:text-white"
            }`}
            >
                {outOfStock ? "স্টক নেই" : "কার্টে যোগ করুন"}
            </button>
        </div>
    );
}