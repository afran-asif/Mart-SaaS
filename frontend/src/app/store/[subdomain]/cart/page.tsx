"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import { RootState } from "@/redux/store";
import { decreaseQuantity, removeFromCart, addToCart, toggleSelectItem, setSelectAll, syncCartPrices } from "@/redux/cartSlice";
import { trackAddToCart } from "@/lib/tracking";
import { api } from "@/services/api";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";
import { themeBgMap, isDarkTheme, isLuxeTheme } from "@/lib/storeTheme";

export default function CartPage() {
    const dispatch = useDispatch();
    const { items, totalQuantity, selectedIds } = useSelector((state: RootState) => state.cart);
    const [theme, setTheme] = useState("classic");
    const [brand, setBrand] = useState("#F4501A");
    useEffect(() => {
        api.get("/tenant/store").then((res) => {
            setTheme(res.data.store?.theme || "classic");
            setBrand(res.data.store?.brandColor || "#F4501A");
        }).catch(() => {});
    }, []);

    // বিক্রেতা দাম/স্টক বদলালে কার্টে sync — server থেকে fresh data
    useEffect(() => {
        const syncCart = async () => {
            if (items.length === 0) return;
            try {
                const response = await api.get("/tenant/products");
                const products: { _id: string; price?: number; stock?: number; name?: string }[] =
                    response.data?.products || [];
                if (products.length > 0) {
                    dispatch(syncCartPrices(products));
                }
            } catch {
                // sync fail হলে পুরোনো price-ই থাকবে — নীরবে ফেল
            }
        };
        syncCart();
    }, [dispatch]);

    // Checkout-এর জন্য শুধু selected item
    const selectedItems = selectedIds === null ? items : items.filter((item) => selectedIds.includes(item._id));
    const selectedTotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const selectedCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    const allSelected = items.length > 0 && selectedItems.length === items.length;

    const handleIncrease = (item: (typeof items)[number]) => {
        dispatch(addToCart({ product: item, quantity: 1 }));
        trackAddToCart({ id: item._id, name: item.name, price: item.price }, 1);
    };

    const handleDecrease = (id: string) => {
        dispatch(decreaseQuantity(id));
    };

    const handleRemove = (id: string) => {
        dispatch(removeFromCart(id));
    };

    const bg = themeBgMap[theme] || themeBgMap.classic;
    const isDark = isDarkTheme(theme);
    const isLuxe = isLuxeTheme(theme);
    return (
        <div className={`min-h-screen ${bg}`}>
            {/* হেডার */}
            <StorefrontHeader variant="sub" brandColor={brand} />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <p className={`font-['IBM_Plex_Mono'] text-[11px] tracking-[0.2em] uppercase mb-2 ${isLuxe ? "text-[#d4af37]" : isDark ? "text-white/60" : "text-[#C6A15B]"}`}>
                    Shopping bag
                </p>
                <h1 className={`font-['Fraunces',serif] text-3xl sm:text-4xl font-semibold mb-1 tracking-tight ${isLuxe ? "text-[#d4af37]" : isDark ? "text-white" : "text-[#181410]"}`}>
                    আপনার কার্ট
                </h1>
                <p className={`font-['IBM_Plex_Mono'] text-xs tracking-widest uppercase mb-6 sm:mb-8 ${isDark ? "text-white/50" : "text-[#75705F]"}`}>
                    {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
                </p>

                {items.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-2xl border border-[#181410]/10 px-6">
                        <div className="w-16 h-16 rounded-full bg-[#F4EEE2] flex items-center justify-center text-2xl mx-auto mb-5">
                            🛍️
                        </div>
                        <p className="font-['Fraunces',serif] text-2xl font-semibold text-[#181410] mb-2">
                            আপনার কার্ট খালি
                        </p>
                        <p className="text-[#75705F] text-sm mb-6">
                            এখনো কোনো প্রোডাক্ট যোগ করেননি।
                        </p>
                        <a
                            href="/"
                            className="inline-block bg-[#F4501A] text-white px-7 py-3 rounded-xl text-sm font-medium hover:bg-[#D63F0F] transition-all shadow-lg shadow-[#F4501A]/25"
                        >
                            কেনাকাটা শুরু করুন
                        </a>
                    </div>
                ) : (
                    <>
                        {/* Select all bar */}
                        <label className="flex items-center gap-3 bg-white rounded-2xl border border-[#181410]/10 px-4 py-3 mb-4 cursor-pointer hover:border-[#C6A15B]/60 transition-colors">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={() => dispatch(setSelectAll(!allSelected))}
                                className="w-5 h-5 rounded accent-[#F4501A] cursor-pointer shrink-0"
                            />
                            <span className="text-sm font-medium text-[#181410]">
                                সব সিলেক্ট করুন
                            </span>
                            <span className="font-['IBM_Plex_Mono'] text-xs text-[#75705F] ml-auto">
                                {selectedItems.length}/{items.length} selected
                            </span>
                        </label>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                        {/* বাম পাশ — আইটেম লিস্ট */}
                        <div className="lg:col-span-2 flex flex-col gap-4">
                            {items.map((item) => (
                                <div
                                    key={item._id}
                                    className="flex gap-4 bg-white rounded-2xl border border-[#181410]/10 p-4 shadow-[0_10px_30px_-18px_rgba(24,20,16,0.3)] hover:shadow-[0_16px_36px_-18px_rgba(24,20,16,0.35)] transition-shadow"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedIds === null || selectedIds.includes(item._id)}
                                        onChange={() => dispatch(toggleSelectItem(item._id))}
                                        aria-label={`${item.name} সিলেক্ট করুন`}
                                        className="w-5 h-5 rounded accent-[#F4501A] cursor-pointer shrink-0 self-center"
                                    />
                                    <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-[#F4EEE2] flex-shrink-0">
                                        <img
                                            src={item.image || "/placeholder.png"}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0 flex flex-col">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-['Fraunces',serif] font-medium text-[15px] sm:text-base text-[#181410] truncate leading-snug">
                                                {item.name}
                                            </h3>
                                            <button
                                                onClick={() => handleRemove(item._id)}
                                                className="text-[#75705F] hover:text-red-600 text-xs flex-shrink-0 underline underline-offset-2 transition-colors"
                                                aria-label="সরিয়ে ফেলুন"
                                            >
                                                সরান
                                            </button>
                                        </div>

                                        <p className="font-['IBM_Plex_Mono'] text-sm text-[#0E3B2C] font-medium mt-1">
                                            ৳{item.price}
                                        </p>

                                        {/* Quantity কন্ট্রোল */}
                                        <div className="flex items-center gap-3 mt-auto pt-3">
                                            <div className="flex items-center gap-1 bg-[#F4EEE2] rounded-full p-1">
                                                <button
                                                    onClick={() => handleDecrease(item._id)}
                                                    disabled={item.quantity <= 1}
                                                    className="w-7 h-7 rounded-full bg-white border border-[#181410]/10 flex items-center justify-center text-[#181410] hover:border-[#C6A15B] transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[#181410]/10"
                                                    aria-label="কমান"
                                                >
                                                    −
                                                </button>
                                                <span className="font-['IBM_Plex_Mono'] text-sm w-7 text-center text-[#181410]">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleIncrease(item)}
                                                    disabled={item.stock !== undefined && item.quantity >= item.stock}
                                                    className="w-7 h-7 rounded-full bg-white border border-[#181410]/10 flex items-center justify-center text-[#181410] hover:border-[#C6A15B] transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                                                    aria-label="বাড়ান"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <span className="font-['IBM_Plex_Mono'] text-xs text-[#75705F] ml-auto">
                                                ৳{item.price * item.quantity}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ডান পাশ — সারাংশ */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl border border-[#181410]/10 border-t-2 border-t-[#C6A15B] p-5 sm:p-6 sticky top-24 shadow-[0_16px_40px_-20px_rgba(24,20,16,0.3)]">
                                <h2 className="font-['Fraunces',serif] font-semibold text-xl text-[#181410] mb-4">
                                    সারাংশ
                                </h2>

                                <div className="flex justify-between text-sm text-[#181410]/80 mb-2">
                                    <span>সাবটোটাল ({selectedCount} {selectedCount === 1 ? "item" : "items"})</span>
                                    <span className="font-['IBM_Plex_Mono']">৳{selectedTotal}</span>
                                </div>
                                <div className="flex justify-between text-xs text-[#75705F] mb-4">
                                    <span>ডেলিভারি চার্জ</span>
                                    <span>চেকআউটে হিসাব হবে</span>
                                </div>

                                <div className="border-t border-[#181410]/10 pt-4 flex justify-between font-medium text-[#181410] mb-6">
                                    <span>মোট</span>
                                    <span className="font-['Fraunces',serif] text-xl">৳{selectedTotal}</span>
                                </div>

                                {selectedItems.length > 0 ? (
                                    <Link
                                        href="/checkout"
                                        className="block w-full text-center bg-[#F4501A] text-white py-3.5 rounded-xl text-sm font-medium hover:bg-[#D63F0F] transition-all shadow-lg shadow-[#F4501A]/25"
                                    >
                                        চেকআউটে যান →
                                    </Link>
                                ) : (
                                    <span className="block w-full text-center bg-[#75705F]/15 text-[#75705F] py-3.5 rounded-xl text-sm font-medium cursor-not-allowed">
                                        আইটেম সিলেক্ট করুন
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    </>
                )}
            </main>
        </div>
    );
}