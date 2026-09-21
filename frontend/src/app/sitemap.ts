import type { MetadataRoute } from "next";

export const revalidate = 86400;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vendoo.shop";
const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface StoreInfo {
    id: string;
    subdomain: string;
    storeName: string;
    updatedAt?: string;
}

interface TenantProduct {
    _id: string;
    updatedAt?: string;
}

function storeBaseUrl(subdomain: string): string {
    try {
        const origin = new URL(siteUrl);
        return `${origin.protocol}//${subdomain}.${origin.host}`;
    } catch {
        return `https://${subdomain}.vendoo.shop`;
    }
}

async function fetchStores(): Promise<StoreInfo[]> {
    try {
        const res = await fetch(`${apiBase}/store/all`, {
            next: { revalidate: 86400 },
        });

        if (!res.ok) {
            return [];
        }

        const data = await res.json();
        return (data.stores as StoreInfo[]) || [];
    } catch {
        return [];
    }
}

async function fetchStoreProducts(subdomain: string): Promise<TenantProduct[]> {
    try {
        const res = await fetch(`${apiBase}/tenant/products`, {
            headers: { "X-Tenant-Subdomain": subdomain },
            next: { revalidate: 86400 },
        });

        if (!res.ok) {
            return [];
        }

        const data = await res.json();
        return (data.products as TenantProduct[]) || [];
    } catch {
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    const staticEntries: MetadataRoute.Sitemap = [
        {
            url: siteUrl,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 1,
            alternates: {
                languages: {
                    en: `${siteUrl}/en`,
                    bn: `${siteUrl}/bn`,
                },
            },
        },
        {
            url: `${siteUrl}/en`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.9,
            alternates: {
                languages: {
                    bn: `${siteUrl}/bn`,
                },
            },
        },
        {
            url: `${siteUrl}/bn`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.9,
            alternates: {
                languages: {
                    en: `${siteUrl}/en`,
                },
            },
        },
        {
            url: `${siteUrl}/en/register`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${siteUrl}/bn/register`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.5,
        },
    ];

    const stores = await fetchStores();

    const storeEntries: MetadataRoute.Sitemap = [];

    for (const store of stores) {
        const base = storeBaseUrl(store.subdomain);

        storeEntries.push({
            url: base,
            lastModified: store.updatedAt ? new Date(store.updatedAt) : now,
            changeFrequency: "weekly",
            priority: 0.8,
        });

        const products = await fetchStoreProducts(store.subdomain);

        for (const product of products) {
            storeEntries.push({
                url: `${base}/product/${product._id}`,
                lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
                changeFrequency: "weekly",
                priority: 0.6,
            });
        }
    }

    return [...staticEntries, ...storeEntries];
}