import CartIcon from "@/components/storefront/CartIcon";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";
import StoreSocialLinks from "@/components/storefront/StoreSocialLinks";
import StorefrontFooter from "@/components/storefront/StorefrontFooter";
import ShopByCategory from "@/components/storefront/ShopByCategory";
import Link from "next/link";
import type { Metadata } from "next";
import StoreCollection from "@/components/storefront/StoreCollection";
import FeaturedSlider from "@/components/storefront/FeaturedSlider";


interface Product {
    _id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
    featured?: boolean;
}

interface Store {
    storeName: string;
    logo?: string;
    facebookPixelId?: string;
    googleAnalyticsId?: string;
    tiktokPixelId?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    whatsappNumber?: string;
    brandColor?: string | null;
    heroTitle?: string | null;
    heroSubtitle?: string | null;
    heroImage?: string | null;
    theme?: string | null;
    plan?: string;
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
    const { subdomain } = await params;
    const data = await getStoreData(subdomain);

    if (!data) {
        return {
            title: "Store Not Found",
        };
    }

    const { store } = data;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vendoo.shop";
    const siteHost = siteUrl.replace(/^https?:\/\//, "").split("/")[0];
    const protocol = siteHost.includes("localhost") ? "http" : "https";
    const storeUrl = `${protocol}://${subdomain}.${siteHost}`;
    const title = `${store.storeName} - Shop Online`;
    const description = `${store.storeName}-এ কেনাকাটা করুন। সেরা দামে সেরা প্রোডাক্ট।`;
    const ogDescription = `${store.storeName}-এর অফিসিয়াল অনলাইন স্টোর`;
    const ogImages = store.logo ? [store.logo] : [];

    return {
        metadataBase: new URL(siteUrl),
        title,
        description,
        // vendor store logo browser tab-এ (না থাকলে default favicon)
        icons: {
            icon: store.logo || "/favicon.ico",
        },
        openGraph: {
            type: "website",
            url: storeUrl,
            siteName: store.storeName,
            title,
            description: ogDescription,
            images: ogImages,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description: ogDescription,
            images: ogImages,
        },
    };
}

async function getStoreData(subdomain: string) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

    const [storeRes, productsRes, featuredRes, categoriesRes] = await Promise.all([
        fetch(`${baseUrl}/tenant/store`, {
            headers: { "X-Tenant-Subdomain": subdomain },
            cache: "no-store",
        }),
        fetch(`${baseUrl}/tenant/products?sort=random&limit=12`, {
            headers: { "X-Tenant-Subdomain": subdomain },
            cache: "no-store",
        }),
        fetch(`${baseUrl}/tenant/products?featured=true`, {
            headers: { "X-Tenant-Subdomain": subdomain },
            cache: "no-store",
        }),
        fetch(`${baseUrl}/tenant/categories`, {
            headers: { "X-Tenant-Subdomain": subdomain },
            cache: "no-store",
        }),
    ]);

    if (!storeRes.ok || !productsRes.ok) {
        return null;
    }

    const storeData = await storeRes.json();
    const productsData = await productsRes.json();
    let featured: Product[] = [];
    try {
        if (featuredRes.ok) featured = (await featuredRes.json()).products || [];
    } catch { /* optional */ }
    let categories: { name: string; productCount: number; thumbnail?: string | null }[] = [];
    try {
        if (categoriesRes.ok) {
            const categoriesData = await categoriesRes.json();
            categories = categoriesData.categories || [];
        }
    } catch { /* categories optional */ }

    return {
        store: storeData.store as Store,
        products: productsData.products as Product[],
        total: productsData.total ?? productsData.products?.length ?? 0,
        featured,
        categories,
    };
}

export default async function StorePage({
    params,
}: {
    params: Promise<{ subdomain: string }>;
}) {
    const { subdomain } = await params;
    const data = await getStoreData(subdomain);

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7]">
                <div className="text-center px-6">
                    <p className="font-['IBM_Plex_Mono'] text-xs tracking-[0.2em] uppercase text-[#75705F] mb-3">
                        404 / NOT FOUND
                    </p>
                    <h1 className="font-['Fraunces',serif] text-3xl sm:text-4xl font-semibold text-[#181410] mb-2 tracking-tight">
                        এই দোকানটি খুঁজে পাওয়া যায়নি
                    </h1>
                    <p className="text-[#75705F]">স্টোরটি বন্ধ আছে অথবা এই ঠিকানায় কোনো দোকান নেই।</p>
                </div>
            </div>
        );
    }

    const { store, products, total, featured, categories } = data;
    const brand = store.brandColor || "#F4501A";
    const hasHero = !!(store.heroTitle || store.heroSubtitle || store.heroImage);
    const theme = (store.theme as string) || "classic";
    const isDark = theme === "bold" || theme === "luxe";
    const isLuxe = theme === "luxe";
    const themeBg: Record<string, string> = {
        classic: "bg-[#FFFDF7]",
        minimal: "bg-white",
        bold: "bg-[#0a0a0a]",
        elegant: "bg-[#fdfbf7]",
        vibrant: "bg-gradient-to-b from-white to-[#fff7ed]",
        retro: "bg-[#fff8dc]",
        luxe: "bg-[#0a0a0a]",
        pastel: "bg-[#fdf2f8]",
        urban: "bg-[#f3f4f6]",
    };

    return (
        <div className={`min-h-screen overflow-x-clip ${themeBg[theme] || themeBg.classic}`}>
            {/* Header — শপ ব্যানার */}
            <StorefrontHeader variant="home" storeName={store.storeName} storeLogo={store.logo} brandColor={brand} theme={theme} />

            {/* Hero */}
            {hasHero && (
                <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
                    <div
                        className="relative overflow-hidden rounded-2xl border border-[#181410]/10 flex flex-col sm:flex-row min-h-[320px] sm:min-h-[450px] lg:min-h-[600px]"
                        style={{ background: store.heroImage ? undefined : brand }}
                    >
                        {store.heroImage ? (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={store.heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                                <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${brand}E6 0%, ${brand}99 45%, transparent 100%)` }} />
                            </>
                        ) : null}
                        <div className={`relative z-[1] flex-1 p-6 sm:p-8 lg:p-10 flex flex-col justify-center ${isLuxe ? "text-black" : "text-white"}`}>
                            {store.heroTitle && (
                                <h2 className={`font-['Fraunces',serif] text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight leading-tight ${isLuxe ? "text-black" : "text-white"}`}>
                                    {store.heroTitle}
                                </h2>
                            )}
                            {store.heroSubtitle && (
                                <p className={`mt-2 sm:mt-3 text-sm sm:text-base leading-relaxed max-w-xl ${isLuxe ? "text-black/80" : "text-white/90"}`}>
                                    {store.heroSubtitle}
                                </p>
                            )}
                            <a
                                href="#collection"
                                className={`mt-5 inline-flex self-start px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg transition-colors ${isLuxe ? "bg-[#d4af37] text-black hover:bg-[#c9a030]" : "bg-white text-[#181410] hover:bg-[#FFFDF7]"}`}
                            >
                                Shop now →
                            </a>
                        </div>
                        {store.heroImage && <div className="hidden sm:block flex-1 min-h-[220px]" />}
                    </div>
                </section>
            )}

            {/* Shop By Category */}
            {categories.length > 0 && (
                <ShopByCategory categories={categories} brand={brand} theme={theme} />
            )}

            {/* Featured */}
            {featured.length > 0 && (
                <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-1 h-6 rounded-full" style={{ background: brand }} />
                        <h3 className={`font-['Fraunces',serif] text-xl sm:text-2xl font-semibold ${isLuxe ? "text-[#d4af37]" : isDark ? "text-white" : "text-[#181410]"}`}>Best Picks</h3>
                        <span className={`text-xs font-['IBM_Plex_Mono'] tracking-widest uppercase ${isLuxe ? "text-[#d4af37]/60" : isDark ? "text-white/50" : "text-[#75705F]"}`}>★ {featured.length}</span>
                    </div>
                    <FeaturedSlider products={featured} brand={brand} />
                </section>
            )}

{/* Product Grid + Category filter */}
            <main id="collection" className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <StoreCollection initialProducts={products} total={total} categories={categories} theme={theme} brand={brand} moreHref="/products" moreLabel="More products →" />
            </main>

            {/* Track order button (commented out)
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-2 flex justify-center">
                <Link
                    href="/track"
                    className="bg-white px-8 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-gray-100 active:scale-95 active:bg-gray-100 transition-all touch-manipulation [-webkit-tap-highlight-color:transparent]"
                    style={{ color: brand }}
                >
                    Track Your Order →
                </Link>
            </div>
            */}

            {/* Footer */}
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