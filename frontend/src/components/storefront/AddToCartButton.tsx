"use client";

import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
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
    const outOfStock = product.stock === 0;

    const handleAddToCart = () => {
        dispatch(addToCart({ product, quantity: 1 }));
        toast.success(`${product.name} কার্টে যোগ হয়েছে`);
    };

    return (
        <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className={`w-full py-3.5 rounded-lg font-medium text-sm transition-colors ${
                outOfStock
                    ? "bg-[#8B8F82]/20 text-[#8B8F82] cursor-not-allowed"
                    : "bg-[#274B3B] text-[#F6F3EC] hover:bg-[#1F3D2F]"
            }`}
        >
            {outOfStock ? "স্টক নেই" : "কার্টে যোগ করুন"}
        </button>
    );
}