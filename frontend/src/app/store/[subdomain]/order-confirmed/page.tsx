import type { Metadata } from "next";
import { Suspense } from "react";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";
import OrderConfirmedContent from "./order-confirmed-content";
import { getStoreName } from "@/lib/store";
import { themeBgMap } from "@/lib/storeTheme";

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

async function getStoreTheme(subdomain: string) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    try {
        const res = await fetch(`${baseUrl}/tenant/store`, { headers: { "X-Tenant-Subdomain": subdomain }, cache: "no-store" });
        if (!res.ok) return { theme: "classic", brandColor: null };
        const data = await res.json();
        return { theme: data.store?.theme || "classic", brandColor: data.store?.brandColor || null };
    } catch { return { theme: "classic", brandColor: null }; }
}

export default async function OrderConfirmedPage({ params }: { params: Promise<{ subdomain: string }> }) {
    const { subdomain } = await params;
    const storeInfo = await getStoreTheme(subdomain);
    const bg = themeBgMap[storeInfo.theme as string] || themeBgMap.classic;
    return (
        <div className={`min-h-screen ${bg}`}>
            <StorefrontHeader variant="sub" brandColor={storeInfo.brandColor || undefined} theme={storeInfo.theme || undefined} />
            <Suspense fallback={<div className="text-center py-20 text-[#75705F]">লোড হচ্ছে...</div>}>
                <OrderConfirmedContent />
            </Suspense>
        </div>
    );
}