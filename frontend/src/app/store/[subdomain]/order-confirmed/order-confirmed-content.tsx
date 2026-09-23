"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { trackPurchase, TrackCartItem } from "@/lib/tracking";

export default function OrderConfirmedContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const totalFromQuery = searchParams.get("total");
    const hasTrackedRef = useRef(false);

    useEffect(() => {
        if (!orderId || hasTrackedRef.current) return;

        // Prevent duplicate tracking on page refresh
        const storageKey = `tracked_purchase_${orderId}`;
        if (sessionStorage.getItem(storageKey)) return;

        let totalAmount = totalFromQuery ? parseFloat(totalFromQuery) : 0;
        let items: TrackCartItem[] = [];

        try {
            const savedOrder = sessionStorage.getItem("last_order");
            if (savedOrder) {
                const parsed = JSON.parse(savedOrder);
                if (parsed.items && Array.isArray(parsed.items)) {
                    items = parsed.items;
                }
                if (!totalAmount && parsed.totalAmount) {
                    totalAmount = parsed.totalAmount;
                }
            }
        } catch {}

        trackPurchase({
            orderId,
            totalAmount,
            items,
        });

        hasTrackedRef.current = true;
        try {
            sessionStorage.setItem(storageKey, "true");
        } catch {}
    }, [orderId, totalFromQuery]);

    return (
        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <div className="bg-white rounded-3xl border border-[#181410]/10 border-t-2 border-t-[#C6A15B] px-6 py-10 sm:px-12 sm:py-12 text-center shadow-[0_24px_60px_-24px_rgba(24,20,16,0.3)]">
                <div className="relative w-20 h-20 mx-auto mb-6">
                    <span className="absolute inset-0 rounded-full bg-[#C6A15B]/20" />
                    <span className="absolute inset-1.5 rounded-full border-2 border-[#C6A15B]/60" />
                    <span className="absolute inset-3 rounded-full bg-[#0E3B2C] flex items-center justify-center">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFFDF7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                    </span>
                </div>

                <p className="font-['IBM_Plex_Mono'] text-[11px] tracking-[0.2em] uppercase text-[#C6A15B] mb-2">
                    Thank you
                </p>
                <h1 className="font-['Fraunces',serif] text-3xl sm:text-4xl font-semibold text-[#181410] mb-2 tracking-tight">
                    অর্ডার সফলভাবে সম্পন্ন হয়েছে!
                </h1>
                <p className="text-[#75705F] text-sm mb-1">
                    ধন্যবাদ আপনার অর্ডারের জন্য।
                </p>

                {orderId && (
                    <p className="inline-block font-['IBM_Plex_Mono'] text-xs text-[#0E3B2C] bg-[#0E3B2C]/5 border border-[#0E3B2C]/15 rounded-full px-4 py-1.5 mt-5 mb-2">
                        অর্ডার আইডি: {orderId}
                    </p>
                )}

                <div className="mt-6">
                    <a
                        href="/"
                        className="inline-block bg-[#F4501A] text-white px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-[#D63F0F] transition-all shadow-lg shadow-[#F4501A]/25"
                    >
                        আরও কেনাকাটা করুন
                    </a>
                </div>
            </div>
        </main>
    );
}