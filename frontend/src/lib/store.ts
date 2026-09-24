interface StoreInfo {
    storeName: string;
    logo?: string | null;
    facebookPixelId?: string | null;
    googleAnalyticsId?: string | null;
    tiktokPixelId?: string | null;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    whatsappNumber?: string | null;
}

export async function getStoreInfo(subdomain: string): Promise<StoreInfo | null> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

    try {
        const res = await fetch(`${baseUrl}/tenant/store`, {
            headers: { "X-Tenant-Subdomain": subdomain },
            cache: "no-store",
        });

        if (!res.ok) {
            return null;
        }

        const data = await res.json();
        return (data.store as StoreInfo) || null;
    } catch {
        return null;
    }
}

export async function getStoreName(subdomain: string): Promise<string | null> {
    const store = await getStoreInfo(subdomain);
    return store?.storeName || null;
}