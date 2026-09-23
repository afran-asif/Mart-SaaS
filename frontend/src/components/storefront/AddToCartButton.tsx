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

export default function AddToCartButton({ product }: { product: Product }) {
    const dispatch = useDispatch();
    const router = useRouter();
    const outOfStock = product.stock === 0;

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
                className={`w-full py-3.5 rounded-lg font-medium text-sm transition-colors ${
                    outOfStock
                        ? "bg-[#8B8F82]/20 text-[#8B8F82] cursor-not-allowed"
                        : "bg-[#274B3B] text-[#F6F3EC] hover:bg-[#1F3D2F]"
                }`}
            >
                {outOfStock ? "স্টক নেই" : "এখনই কিনুন"}
            </button>
            <button
                onClick={handleAddToCart}
                disabled={outOfStock}
                className={`w-full py-3.5 rounded-lg font-medium text-sm transition-colors border ${
                    outOfStock
                        ? "border-[#8B8F82]/20 text-[#8B8F82] cursor-not-allowed"
                        : "border-[#274B3B] text-[#274B3B] hover:bg-[#274B3B]/5"
                }`}
            >
                {outOfStock ? "স্টক নেই" : "কার্টে যোগ করুন"}
            </button>
        </div>
    );
}