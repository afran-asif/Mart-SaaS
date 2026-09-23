import type { Metadata } from "next";
import { Suspense } from "react";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";
import OrderConfirmedContent from "./order-confirmed-content";
import { getStoreName } from "@/lib/store";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
    const { subdomain } = await params;
    const storeName = await getStoreName(subdomain);

    return {
        title: storeName ? `${storeName} - Order Confirmed` : "Order Confirmed",
    };
}

export default function OrderConfirmedPage() {
    return (
        <div className="min-h-screen bg-[#FFFDF7]">
            <StorefrontHeader variant="sub" />
            <Suspense fallback={<div className="text-center py-20 text-[#75705F]">লোড হচ্ছে...</div>}>
                <OrderConfirmedContent />
            </Suspense>
        </div>
    );
}