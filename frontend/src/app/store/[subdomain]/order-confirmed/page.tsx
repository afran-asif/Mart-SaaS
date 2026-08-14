"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";

function OrderConfirmedContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");

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
                ধন্যবাদ আপনার অর্ডারের জন্য। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
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

export default function OrderConfirmedPage() {
    return (
        <div className="min-h-screen bg-[#F6F3EC]">
            <StorefrontHeader variant="sub" />
            <Suspense fallback={<div className="text-center py-20 text-[#8B8F82]">লোড হচ্ছে...</div>}>
                <OrderConfirmedContent />
            </Suspense>
        </div>
    );
}