"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { decreaseQuantity, removeFromCart, addToCart } from "@/redux/cartSlice";
import { trackAddToCart } from "@/lib/tracking";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";

export default function CartPage() {
    const dispatch = useDispatch();
    const { items, totalAmount, totalQuantity } = useSelector((state: RootState) => state.cart);

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

    return (
        <div className="min-h-screen bg-[#FFFDF7]">
            {/* হেডার */}
            <StorefrontHeader variant="sub" />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <p className="font-['IBM_Plex_Mono'] text-[11px] tracking-[0.2em] uppercase text-[#C6A15B] mb-2">
                    Shopping bag
                </p>
                <h1 className="font-['Fraunces',serif] text-3xl sm:text-4xl font-semibold text-[#181410] mb-1 tracking-tight">
                    আপনার কার্ট
                </h1>
                <p className="font-['IBM_Plex_Mono'] text-xs tracking-widest uppercase text-[#75705F] mb-6 sm:mb-8">
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                        {/* বাম পাশ — আইটেম লিস্ট */}
                        <div className="lg:col-span-2 flex flex-col gap-4">
                            {items.map((item) => (
                                <div
                                    key={item._id}
                                    className="flex gap-4 bg-white rounded-2xl border border-[#181410]/10 p-4 shadow-[0_10px_30px_-18px_rgba(24,20,16,0.3)] hover:shadow-[0_16px_36px_-18px_rgba(24,20,16,0.35)] transition-shadow"
                                >
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
                                    <span>সাবটোটাল</span>
                                    <span className="font-['IBM_Plex_Mono']">৳{totalAmount}</span>
                                </div>
                                <div className="flex justify-between text-xs text-[#75705F] mb-4">
                                    <span>ডেলিভারি চার্জ</span>
                                    <span>চেকআউটে হিসাব হবে</span>
                                </div>

                                <div className="border-t border-[#181410]/10 pt-4 flex justify-between font-medium text-[#181410] mb-6">
                                    <span>মোট</span>
                                    <span className="font-['Fraunces',serif] text-xl">৳{totalAmount}</span>
                                </div>

                                <a
                                    href="/checkout"
                                    className="block w-full text-center bg-[#F4501A] text-white py-3.5 rounded-xl text-sm font-medium hover:bg-[#D63F0F] transition-all shadow-lg shadow-[#F4501A]/25"
                                >
                                    চেকআউটে যান →
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}