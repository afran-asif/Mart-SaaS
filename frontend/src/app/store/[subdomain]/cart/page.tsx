"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { decreaseQuantity, removeFromCart, addToCart } from "@/redux/cartSlice";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";

export default function CartPage() {
    const dispatch = useDispatch();
    const { items, totalAmount, totalQuantity } = useSelector((state: RootState) => state.cart);

    const handleIncrease = (item: (typeof items)[number]) => {
        dispatch(addToCart({ product: item, quantity: 1 }));
    };

    const handleDecrease = (id: string) => {
        dispatch(decreaseQuantity(id));
    };

    const handleRemove = (id: string) => {
        dispatch(removeFromCart(id));
    };

    return (
        <div className="min-h-screen bg-[#F6F3EC]">
            {/* হেডার */}
            <StorefrontHeader variant="sub" />

            <main className="max-w-4xl mx-auto px-6 py-10">
                <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-[#1B1E19] mb-1">
                    আপনার কার্ট
                </h1>
                <p className="font-['IBM_Plex_Mono'] text-xs tracking-widest uppercase text-[#8B8F82] mb-8">
                    {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
                </p>

                {items.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="font-['Space_Grotesk'] text-xl font-bold text-[#1B1E19] mb-2">
                            আপনার কার্ট খালি
                        </p>
                        <p className="text-[#8B8F82] text-sm mb-6">
                            এখনো কোনো প্রোডাক্ট যোগ করেননি।
                        </p>
                        <a
                            href="/"
                            className="inline-block bg-[#274B3B] text-[#F6F3EC] px-6 py-3 rounded-lg text-sm font-medium hover:bg-[#1F3D2F] transition-colors"
                        >
                            কেনাকাটা শুরু করুন
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* বাম পাশ — আইটেম লিস্ট */}
                        <div className="lg:col-span-2 flex flex-col gap-4">
                            {items.map((item) => (
                                <div
                                    key={item._id}
                                    className="flex gap-4 bg-white rounded-lg border border-[#1B1E19]/8 p-4"
                                >
                                    <div className="w-20 h-20 rounded-md overflow-hidden bg-[#EFECE3] flex-shrink-0">
                                        <img
                                            src={item.image || "/placeholder.png"}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-medium text-sm text-[#1B1E19] truncate">
                                                {item.name}
                                            </h3>
                                            <button
                                                onClick={() => handleRemove(item._id)}
                                                className="text-[#8B8F82] hover:text-red-600 text-xs flex-shrink-0"
                                                aria-label="সরিয়ে ফেলুন"
                                            >
                                                সরান
                                            </button>
                                        </div>

                                        <p className="font-['IBM_Plex_Mono'] text-sm text-[#274B3B] font-medium mt-1">
                                            ৳{item.price}
                                        </p>

                                        {/* Quantity কন্ট্রোল */}
                                        <div className="flex items-center gap-3 mt-3">
                                            <button
                                                onClick={() => handleDecrease(item._id)}
                                                className="w-7 h-7 rounded-md border border-[#1B1E19]/15 flex items-center justify-center text-[#1B1E19] hover:bg-[#F6F3EC] transition-colors"
                                                aria-label="কমান"
                                            >
                                                −
                                            </button>
                                            <span className="font-['IBM_Plex_Mono'] text-sm w-6 text-center">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => handleIncrease(item)}
                                                disabled={item.stock !== undefined && item.quantity >= item.stock}
                                                className="w-7 h-7 rounded-md border border-[#1B1E19]/15 flex items-center justify-center text-[#1B1E19] hover:bg-[#F6F3EC] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                aria-label="বাড়ান"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ডান পাশ — সারাংশ */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg border border-[#1B1E19]/8 p-5 sticky top-24">
                                <h2 className="font-['Space_Grotesk'] font-bold text-lg text-[#1B1E19] mb-4">
                                    সারাংশ
                                </h2>

                                <div className="flex justify-between text-sm text-[#1B1E19]/80 mb-2">
                                    <span>সাবটোটাল</span>
                                    <span className="font-['IBM_Plex_Mono']">৳{totalAmount}</span>
                                </div>
                                <div className="flex justify-between text-xs text-[#8B8F82] mb-4">
                                    <span>ডেলিভারি চার্জ</span>
                                    <span>চেকআউটে হিসাব হবে</span>
                                </div>

                                <div className="border-t border-[#1B1E19]/10 pt-4 flex justify-between font-medium text-[#1B1E19] mb-6">
                                    <span>মোট</span>
                                    <span className="font-['IBM_Plex_Mono']">৳{totalAmount}</span>
                                </div>

                                <a
                                    href="/checkout"
                                    className="block w-full text-center bg-[#274B3B] text-[#F6F3EC] py-3 rounded-lg text-sm font-medium hover:bg-[#1F3D2F] transition-colors"
                                >
                                    চেকআউটে যান
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}