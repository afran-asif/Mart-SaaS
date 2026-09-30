import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";
import StoreCollection from "@/components/storefront/StoreCollection";
import { themeBgMap, isDarkTheme, isLuxeTheme } from "@/lib/storeTheme";

export const revalidate = 60;

interface Product {
    _id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
    featured?: boolean;
    category?: string;
}

async function getCategoryData(subdomain: string, slug: string) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

    const [storeRes, productsRes, categoriesRes] = await Promise.all([
        fetch(`${baseUrl}/tenant/store`, { headers: { "X-Tenant-Subdomain": subdomain } }),
        fetch(`${baseUrl}/tenant/products`, { headers: { "X-Tenant-Subdomain": subdomain } }),
        fetch(`${baseUrl}/tenant/categories`, { headers: { "X-Tenant-Subdomain": subdomain } }),
    ]);

    if (!storeRes.ok || !productsRes.ok) return null;

    const store = (await storeRes.json()).store;
    const products = (await productsRes.json()).products as Product[];
    let categories: { name: string; productCount: number }[] = [];
    try {
        if (categoriesRes.ok) categories = (await categoriesRes.json()).categories || [];
    } catch { /* optional */ }

    const name = decodeURIComponent(slug);
    const match = categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (!match) return null;

    const filtered = products.filter(
        (p) => (p.category || "General").toLowerCase() === match.name.toLowerCase()
    );

    return { store, products: filtered, categories, categoryName: match.name };
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ subdomain: string; slug: string }>;
}): Promise<Metadata> {
    const { subdomain, slug } = await params;
    const data = await getCategoryData(subdomain, slug);
    if (!data) return { title: "Category Not Found" };
    return {
        title: `${data.categoryName} — ${data.store.storeName}`,
        description: `${data.store.storeName}-এর ${data.categoryName} কালেকশন থেকে কেনাকাটা করুন।`,
    };
}

export default async function CategoryPage({
    params,
}: {
    params: Promise<{ subdomain: string; slug: string }>;
}) {
    const { subdomain, slug } = await params;
    const data = await getCategoryData(subdomain, slug);
    if (!data) notFound();

    const { store, products, categories, categoryName } = data;
    const brand = store.brandColor || "#F4501A";
    const theme = store.theme || "classic";
    const bg = themeBgMap[theme] || themeBgMap.classic;
    const isDark = isDarkTheme(theme);
    const isLuxe = isLuxeTheme(theme);

    return (
        <div className={`min-h-screen ${bg}`}>
            <StorefrontHeader
                variant="home"
                storeName={store.storeName}
                storeLogo={store.logo}
                brandColor={brand}
                theme={theme}
            />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Breadcrumb */}
                <nav className={`font-['IBM_Plex_Mono'] text-[11px] tracking-[0.18em] uppercase mb-6 ${isLuxe ? "text-[#d4af37]/60" : isDark ? "text-white/50" : "text-[#75705F]"}`}>
                    <Link href="/" className="hover:underline underline-offset-4">Home</Link>
                    <span className="mx-2">/</span>
                    <span className={isLuxe ? "text-[#d4af37]" : isDark ? "text-white" : "text-[#181410]"}>{categoryName}</span>
                </nav>

                <StoreCollection
                    products={products}
                    categories={categories}
                    theme={theme}
                    brand={brand}
                    title={categoryName}
                    activeCategory={categoryName}
                />
            </main>

            <footer className={`border-t mt-4 ${isDark ? "border-white/10" : "border-[#C6A15B]/30"}`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Link
                        href="/"
                        className={`font-['IBM_Plex_Mono'] text-[11px] tracking-[0.18em] uppercase underline-offset-4 hover:underline ${isLuxe ? "text-[#d4af37]" : isDark ? "text-white/70" : "text-[#0E3B2C]"}`}
                    >
                        ← Back to {store.storeName}
                    </Link>
                    {store.plan !== "pro" && (
                        <p className={`font-['IBM_Plex_Mono'] text-[11px] tracking-[0.18em] uppercase ${isLuxe ? "text-[#d4af37]/60" : isDark ? "text-white/50" : "text-[#75705F]"}`}>
                            Powered by Vendoo
                        </p>
                    )}
                </div>
            </footer>
        </div>
    );
}
