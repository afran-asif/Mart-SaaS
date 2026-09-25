"use client";

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

export default function AddToCartButton({ product, theme = "classic" }: { product: Product; theme?: string }) {
    const dispatch = useDispatch();
    const router = useRouter();
    const outOfStock = product.stock === 0;
    const isLuxe = theme === "luxe";
    const isDark = theme === "bold" || theme === "luxe";

    const handleAddToCart = () => {
        dispatch(addToCart({ product, quantity: 1 }));
        trackAddToCart({ id: product._id, name: product.name, price: product.price }, 1);
        toast.success(`${product.name} কার্টে যোগ হয়েছে`);
    };

    const handleBuyNow = () => {
        dispatch(setBuyNow(product));
        trackAddToCart({ id: product._id, name: product.name, price: product.price }, 1);
        router.push("/checkout");
    };

    return (
        <div className="flex flex-col gap-3">
            <button
                onClick={handleBuyNow}
                disabled={outOfStock}
            className={`w-full py-3.5 rounded-xl font-medium text-sm transition-all ${
                outOfStock
                    ? "bg-[#75705F]/15 text-[#75705F] cursor-not-allowed"
                    : "bg-[#F4501A] text-white hover:bg-[#D63F0F] shadow-lg shadow-[#F4501A]/25 hover:shadow-xl hover:shadow-[#F4501A]/30"
            }`}
            >
                {outOfStock ? "স্টক নেই" : "এখনই কিনুন"}
            </button>
            <button
                onClick={handleAddToCart}
                disabled={outOfStock}
            className={`w-full py-3.5 rounded-xl font-medium text-sm transition-all border-2 ${
                outOfStock
                    ? "border-[#75705F]/20 text-[#75705F] cursor-not-allowed"
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