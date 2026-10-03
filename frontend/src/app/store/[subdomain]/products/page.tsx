import type { Metadata } from "next";
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

async function getProductsData(subdomain: string, search?: string) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

    const qs = new URLSearchParams({ page: "1", limit: "24" });
    if (search) qs.set("search", search);

    const [storeRes, productsRes, categoriesRes] = await Promise.all([
        fetch(`${baseUrl}/tenant/store`, { headers: { "X-Tenant-Subdomain": subdomain } }),
        fetch(`${baseUrl}/tenant/products?${qs.toString()}`, { headers: { "X-Tenant-Subdomain": subdomain } }),
        fetch(`${baseUrl}/tenant/categories`, { headers: { "X-Tenant-Subdomain": subdomain } }),
    ]);

    if (!storeRes.ok || !productsRes.ok) return null;

    const store = (await storeRes.json()).store;
    const productsData = await productsRes.json();
    const products = productsData.products as Product[];
    const total = productsData.total ?? products.length;
    let categories: { name: string; productCount: number }[] = [];
    try {
        if (categoriesRes.ok) categories = (await categoriesRes.json()).categories || [];
    } catch { /* optional */ }

    return { store, products, total, categories };
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
    const { subdomain } = await params;
    const data = await getProductsData(subdomain);
    if (!data) return { title: "Products Not Found" };
    return {
        title: `All Products — ${data.store.storeName}`,
        description: `${data.store.storeName}-এর সব পণ্য এক জায়গায়।`,
    };
}

export default async function AllProductsPage({
    params,
    searchParams,
}: {
    params: Promise<{ subdomain: string }>;
    searchParams: Promise<{ q?: string }>;
}) {
    const { subdomain } = await params;
    const { q } = await searchParams;
    const search = q?.trim() || undefined;
    const data = await getProductsData(subdomain, search);
    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7]">
                <div className="text-center px-6">
                    <p className="font-['IBM_Plex_Mono'] text-xs tracking-[0.2em] uppercase text-[#75705F] mb-3">
                        404 / NOT FOUND
                    </p>
                    <h1 className="font-['Fraunces',serif] text-3xl font-semibold text-[#181410] mb-2 tracking-tight">
                        এই দোকানটি খুঁজে পাওয়া যায়নি
                    </h1>
                </div>
            </div>
        );
    }

    const { store, products, total, categories } = data;
    const brand = store.brandColor || "#F4501A";
    const theme = store.theme || "classic";
    const bg = themeBgMap[theme] || themeBgMap.classic;
    const isDark = isDarkTheme(theme);
    const isLuxe = isLuxeTheme(theme);

    return (
        <div className={`min-h-screen overflow-x-clip ${bg}`}>
            <StorefrontHeader
                variant="home"
                storeName={store.storeName}
                storeLogo={store.logo}
                brandColor={brand}
                theme={theme}
            />

            <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <nav className={`font-['IBM_Plex_Mono'] text-[11px] tracking-[0.18em] uppercase mb-6 ${isLuxe ? "text-[#d4af37]/60" : isDark ? "text-white/50" : "text-[#75705F]"}`}>
                    <Link href="/" className="hover:underline underline-offset-4">Home</Link>
                    <span className="mx-2">/</span>
                    <span className={isLuxe ? "text-[#d4af37]" : isDark ? "text-white" : "text-[#181410]"}>
                        {search ? `Search: "${search}"` : "All Products"}
                    </span>
                </nav>

                <StoreCollection
                    key={search || "all"}
                    initialProducts={products}
                    total={total}
                    categories={categories}
                    theme={theme}
                    brand={brand}
                    title={search ? `Results for "${search}"` : "All Products"}
                    search={search}
                    controls
                />
            </main>

            <footer className={`border-t mt-4 ${isDark ? "border-white/10" : "border-[#C6A15B]/30"}`}>
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
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
