"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/services/api";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";
import { themeBgMap, isDarkTheme, isLuxeTheme } from "@/lib/storeTheme";

interface TrackedOrder {
    id: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    totalAmount: number;
    storeName: string;
    createdAt: string;
    updatedAt: string;
    items: Array<{ name: string; quantity: number; price: number }>;
}

const STEPS = ["Pending", "Processing", "Delivered"];

function TrackContent() {
    const searchParams = useSearchParams();
    const [theme, setTheme] = useState("classic");
    const [brand, setBrand] = useState("#F4501A");
    const [orderId, setOrderId] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [order, setOrder] = useState<TrackedOrder | null>(null);

    useEffect(() => {
        const qOrder = searchParams.get("orderId") || "";
        if (qOrder) setOrderId(qOrder);
        const fetchTheme = async () => {
            try {
                const res = await api.get("/tenant/store");
                setTheme(res.data.store.theme || "classic");
                setBrand(res.data.store.brandColor || "#F4501A");
            } catch { /* theme optional */ }
        };
        fetchTheme();
    }, [searchParams]);

    const handleTrack = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!orderId.trim() || !phone.trim()) return;
        setLoading(true);
        setError("");
        setOrder(null);
        try {
            const res = await api.get(`/orders/track/${orderId.trim()}`, { params: { phone: phone.trim() } });
            setOrder(res.data.order as TrackedOrder);
        } catch (err: any) {
            setError(err.message || "অর্ডার পাওয়া যায়নি। ID ও ফোন নম্বর চেক করুন।");
        } finally {
            setLoading(false);
        }
    };

    const bg = themeBgMap[theme] || themeBgMap.classic;
    const isDark = isDarkTheme(theme);
    const isLuxe = isLuxeTheme(theme);
    const titleColor = isLuxe ? "text-[#d4af37]" : isDark ? "text-white" : "text-[#181410]";
    const subColor = isDark ? "text-white/50" : "text-[#75705F]";

    const stepIndex = order ? STEPS.indexOf(order.status) : -1;
    const cancelled = order?.status === "Cancelled";

    return (
        <div className={`min-h-screen ${bg}`}>
            <StorefrontHeader variant="sub" brandColor={brand} theme={theme} />

            <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                <p className={`font-['IBM_Plex_Mono'] text-[11px] tracking-[0.2em] uppercase mb-2 ${isLuxe ? "text-[#d4af37]" : isDark ? "text-white/60" : "text-[#C6A15B]"}`}>
                    Track order
                </p>
                <h1 className={`font-['Fraunces',serif] text-3xl sm:text-4xl font-semibold mb-1 tracking-tight ${titleColor}`}>
                    অর্ডার ট্র্যাক করুন
                </h1>
                <p className={`font-['IBM_Plex_Mono'] text-xs tracking-widest uppercase mb-8 ${subColor}`}>
                    অর্ডার ID ও ফোন নম্বর দিন
                </p>

                <form onSubmit={handleTrack} className="bg-white rounded-2xl border border-[#181410]/10 p-5 shadow-[0_16px_40px_-20px_rgba(24,20,16,0.3)] flex flex-col gap-3">
                    <div>
                        <label className="block text-sm font-medium text-[#181410] mb-1.5">অর্ডার ID</label>
                        <input
                            type="text"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            required
                            placeholder="e.g. 6a3fc6431724d34593b9a173"
                            className="w-full px-4 py-2.5 rounded-xl border border-[#181410]/15 bg-white focus:outline-none focus:ring-2 focus:ring-[#F4501A] text-sm font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#181410] mb-1.5">ফোন নম্বর</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            placeholder="01XXXXXXXXX"
                            className="w-full px-4 py-2.5 rounded-xl border border-[#181410]/15 bg-white focus:outline-none focus:ring-2 focus:ring-[#F4501A] text-sm"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl font-medium text-sm bg-[#F4501A] text-white hover:bg-[#D63F0F] transition-all disabled:opacity-60"
                    >
                        {loading ? "খুঁজছি..." : "ট্র্যাক করুন →"}
                    </button>
                    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
                </form>

                {order && (
                    <div className="bg-white rounded-2xl border border-[#181410]/10 p-5 mt-4 shadow-[0_16px_40px_-20px_rgba(24,20,16,0.3)]">
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="font-mono text-xs text-gray-500">#{String(order.id).slice(-6).toUpperCase()}</p>
                            <p className="font-['IBM_Plex_Mono'] text-sm font-bold text-[#0E3B2C]">৳{order.totalAmount}</p>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">
                            {new Date(order.createdAt).toLocaleString()} · {order.paymentMethod === "COD" ? "ক্যাশ অন ডেলিভারি" : order.paymentStatus}
                        </p>

                        {cancelled ? (
                            <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 font-medium">
                                এই অর্ডারটি বাতিল করা হয়েছে।
                            </p>
                        ) : (
                            <div className="flex items-center mt-2">
                                {STEPS.map((s, i) => {
                                    const done = i <= stepIndex;
                                    const current = i === stepIndex;
                                    return (
                                        <div key={s} className="flex-1 flex items-center last:flex-none">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                                    done ? "bg-[#1F9D55] text-white" : "bg-gray-100 text-gray-400"
                                                }`}>
                                                    {done ? "✓" : i + 1}
                                                </span>
                                                <span className={`text-[11px] font-medium ${current ? "text-[#0E3B2C]" : done ? "text-gray-700" : "text-gray-400"}`}>
                                                    {s === "Pending" ? "পেন্ডিং" : s === "Processing" ? "প্রসেসিং" : "ডেলিভার্ড"}
                                                </span>
                                            </div>
                                            {i < STEPS.length - 1 && (
                                                <div className={`flex-1 h-0.5 mx-1 mb-6 rounded ${i < stepIndex ? "bg-[#1F9D55]" : "bg-gray-200"}`} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-4 pt-3 border-t border-[#181410]/10 flex flex-col gap-1.5">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <span className="text-[#181410]">{item.name} × {item.quantity}</span>
                                    <span className="font-['IBM_Plex_Mono'] text-[#0E3B2C]">৳{item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function TrackPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-gray-500">লোড হচ্ছে...</div>}>
            <TrackContent />
        </Suspense>
    );
}
