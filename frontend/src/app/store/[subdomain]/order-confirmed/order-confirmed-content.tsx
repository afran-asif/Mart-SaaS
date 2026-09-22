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
        <main className="max-w-2xl mx-auto px-6 py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#274B3B] flex items-center justify-center mx-auto mb-6">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F6F3EC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                </svg>
            </div>

            <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-[#1B1E19] mb-2">
                অর্ডার সফলভাবে সম্পন্ন হয়েছে!
            </h1>
            <p className="text-[#8B8F82] text-sm mb-1">
                ধন্যবাদ আপনার অর্ডারের জন্য।
            </p>

            {orderId && (
                <p className="font-['IBM_Plex_Mono'] text-xs text-[#8B8F82] mt-4 mb-8">
                    অর্ডার আইডি: {orderId}
                </p>
            )}

            <a
                href="/"
                className="inline-block bg-[#274B3B] text-[#F6F3EC] px-6 py-3 rounded-lg text-sm font-medium hover:bg-[#1F3D2F] transition-colors mt-4"
            >
                আরও কেনাকাটা করুন
            </a>
        </main>
    );
}