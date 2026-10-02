import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";
import StoreCollection from "@/components/storefront/StoreCollection";
import StorefrontFooter from "@/components/storefront/StorefrontFooter";
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
    const name = decodeURIComponent(slug);

    const [storeRes, productsRes, categoriesRes] = await Promise.all([
        fetch(`${baseUrl}/tenant/store`, { headers: { "X-Tenant-Subdomain": subdomain } }),
        fetch(`${baseUrl}/tenant/products?category=${encodeURIComponent(name)}&page=1&limit=24`, { headers: { "X-Tenant-Subdomain": subdomain } }),
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

    const match = categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (!match && products.length === 0) return null;

    return { store, products, total, categories, categoryName: match ? match.name : name };
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
        icons: {
            icon: data.store.logo || "/favicon.ico",
        },
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

    const { store, products, total, categories, categoryName } = data;
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
                {/* Breadcrumb */}
                <nav className={`font-['IBM_Plex_Mono'] text-[11px] tracking-[0.18em] uppercase mb-6 ${isLuxe ? "text-[#d4af37]/60" : isDark ? "text-white/50" : "text-[#75705F]"}`}>
                    <Link href="/" className="hover:underline underline-offset-4">Home</Link>
                    <span className="mx-2">/</span>
                    <span className={isLuxe ? "text-[#d4af37]" : isDark ? "text-white" : "text-[#181410]"}>{categoryName}</span>
                </nav>

                <StoreCollection
                    initialProducts={products}
                    total={total}
                    categories={categories}
                    theme={theme}
                    brand={brand}
                    title={categoryName}
                    activeCategory={categoryName}
                    category={categoryName}
                />
            </main>

            <StorefrontFooter
                storeName={store.storeName}
                storeLogo={store.logo}
                brandColor={brand}
                tagline={store.heroSubtitle || "Buy your best cloth from here"}
                theme={theme}
                facebookUrl={store.facebookUrl}
                instagramUrl={store.instagramUrl}
                whatsappNumber={store.whatsappNumber}
                phone={store.whatsappNumber}
                plan={store.plan}
            />
        </div>
    );
}
