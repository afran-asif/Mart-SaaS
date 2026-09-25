import CartIcon from "@/components/storefront/CartIcon";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";
import StoreSocialLinks from "@/components/storefront/StoreSocialLinks";
import Link from "next/link";
import type { Metadata } from "next";

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

    const [storeRes, productsRes] = await Promise.all([
        fetch(`${baseUrl}/tenant/store`, {
            headers: { "X-Tenant-Subdomain": subdomain },
            cache: "no-store",
        }),
        fetch(`${baseUrl}/tenant/products`, {
            headers: { "X-Tenant-Subdomain": subdomain },
            cache: "no-store",
        }),
    ]);

    if (!storeRes.ok || !productsRes.ok) {
        return null;
    }

    const storeData = await storeRes.json();
    const productsData = await productsRes.json();

    return {
        store: storeData.store as Store,
        products: productsData.products as Product[],
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

    const { store, products } = data;
    const brand = store.brandColor || "#F4501A";
    const hasHero = !!(store.heroTitle || store.heroSubtitle || store.heroImage);
    const featured = products.filter((p) => p.featured);

    return (
        <div className="min-h-screen bg-[#FFFDF7]">
            {/* Header — শপ ব্যানার */}
            <StorefrontHeader variant="home" storeName={store.storeName} storeLogo={store.logo} brandColor={brand} />

            {/* Hero */}
            {hasHero && (
                <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
                    <div
                        className="relative overflow-hidden rounded-2xl border border-[#181410]/10 flex flex-col sm:flex-row"
                        style={{ background: store.heroImage ? undefined : brand }}
                    >
                        {store.heroImage ? (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={store.heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                                <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${brand}E6 0%, ${brand}99 45%, transparent 100%)` }} />
                            </>
                        ) : null}
                        <div className={`relative z-10 flex-1 p-6 sm:p-8 lg:p-10 flex flex-col justify-center ${store.heroImage ? "text-white" : "text-white"}`}>
                            {store.heroTitle && (
                                <h2 className="font-['Fraunces',serif] text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight leading-tight">
                                    {store.heroTitle}
                                </h2>
                            )}
                            {store.heroSubtitle && (
                                <p className={`mt-2 sm:mt-3 text-sm sm:text-base leading-relaxed max-w-xl ${store.heroImage ? "text-white/90" : "text-white/90"}`}>
                                    {store.heroSubtitle}
                                </p>
                            )}
                            <a
                                href="#collection"
                                className="mt-5 inline-flex self-start px-5 py-2.5 rounded-full bg-white text-[#181410] text-sm font-semibold shadow-lg hover:bg-[#FFFDF7] transition-colors"
                            >
                                Shop now →
                            </a>
                        </div>
                        {store.heroImage && <div className="hidden sm:block flex-1 min-h-[220px]" />}
                    </div>
                </section>
            )}

            {/* Featured */}
            {featured.length > 0 && (
                <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-1 h-6 rounded-full" style={{ background: brand }} />
                        <h3 className="font-['Fraunces',serif] text-xl sm:text-2xl font-semibold text-[#181410]">Featured Picks</h3>
                        <span className="text-xs font-['IBM_Plex_Mono'] tracking-widest uppercase text-[#75705F]">★ {featured.length}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-7">
                        {featured.map((product) => {
                            const outOfStock = product.stock === 0;
                            return (
                                <Link
                                    key={`feat-${product._id}`}
                                    href={`/product/${product._id}`}
                                    className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4501A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFDF7] rounded-2xl"
                                >
                                    <div className="relative bg-white rounded-2xl overflow-hidden border-2 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_20px_40px_-16px_rgba(24,20,16,0.25)]" style={{ borderColor: `${brand}30` }}>
                                        <div className="absolute top-2 left-2 z-10 bg-[#181410] text-white text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest px-2 py-1 rounded-full">★ Featured</div>
                                        <div className="relative aspect-[4/5] overflow-hidden bg-[#F4EEE2]">
                                            <img src={product.images[0] || "/placeholder.png"} alt={product.name} loading="lazy" className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06] ${outOfStock ? "grayscale opacity-60" : ""}`} />
                                            {!outOfStock && <div className="absolute bottom-3 right-3 text-white font-['IBM_Plex_Mono'] font-medium text-xs px-3 py-1.5 rounded-full shadow-lg" style={{ background: brand }}>৳{product.price}</div>}
                                        </div>
                                        <div className="p-3.5 sm:p-4">
                                            <h3 className="font-['Fraunces',serif] font-medium text-[15px] sm:text-base text-[#181410] truncate leading-snug">{product.name}</h3>
                                            <p className="font-['IBM_Plex_Mono'] text-[11px] tracking-wider uppercase text-[#75705F] mt-1">৳{product.price} · {outOfStock ? "Out of stock" : "In stock"}</p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Product Grid */}
            <main id="collection" className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="mb-7 sm:mb-9">
                    <p className="font-['IBM_Plex_Mono'] text-[11px] tracking-[0.2em] uppercase text-[#C6A15B] mb-2">
                        Curated for you · {products.length} {products.length === 1 ? "item" : "items"}
                    </p>
                    <div className="flex items-end justify-between gap-4">
                        <h2 className="font-['Fraunces',serif] text-3xl sm:text-4xl font-semibold text-[#181410] tracking-tight">
                            Shop the collection
                        </h2>
                        <span className="hidden sm:block h-px flex-1 mb-3 bg-gradient-to-r from-[#C6A15B]/60 to-transparent" />
                    </div>
                </div>

                {products.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="font-['Fraunces',serif] text-2xl font-semibold text-[#181410] mb-2">
                            শেলফ এখনো খালি
                        </p>
                        <p className="text-[#75705F] text-sm">এই দোকানে এখনো কোনো প্রোডাক্ট যোগ করা হয়নি।</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-7">
                        {products.map((product) => {
                            const outOfStock = product.stock === 0;
                            return (
                                <Link
                                    key={product._id}
                                    href={`/product/${product._id}`}
                                    className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4501A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFDF7] rounded-2xl"
                                >
                                    <div className="relative bg-white rounded-2xl overflow-hidden border border-[#181410]/10 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_20px_40px_-16px_rgba(24,20,16,0.25)]">
                                        {/* Image */}
                                        <div className="relative aspect-[4/5] overflow-hidden bg-[#F4EEE2]">
                                            <img
                                                src={product.images[0] || "/placeholder.png"}
                                                alt={product.name}
                                                loading="lazy"
                                                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06] ${
                                                    outOfStock ? "grayscale opacity-60" : ""
                                                }`}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#181410]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            {outOfStock && (
                                                <div className="absolute top-3 left-3 bg-[#181410] text-[#FFFDF7] font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.14em] px-2.5 py-1 rounded-full">
                                                    স্টক নেই
                                                </div>
                                            )}

                                            {/* Signature price tag */}
                                            {!outOfStock && (
                                                <div className="absolute bottom-3 right-3 text-white font-['IBM_Plex_Mono'] font-medium text-xs px-3 py-1.5 rounded-full shadow-lg" style={{ background: brand, boxShadow: `0 8px 20px ${brand}40` }}>
                                                    ৳{product.price}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="p-3.5 sm:p-4">
                                            <h3 className="font-['Fraunces',serif] font-medium text-[15px] sm:text-base text-[#181410] truncate leading-snug">
                                                {product.name}
                                            </h3>
                                            <p className="font-['IBM_Plex_Mono'] text-[11px] tracking-wider uppercase text-[#75705F] mt-1">
                                                ৳{product.price} · {outOfStock ? "Out of stock" : "In stock"}
                                            </p>
                                        </div>
                                        <span className="absolute top-0 left-4 right-4 sm:left-6 sm:right-6 h-[2px] bg-gradient-to-r from-transparent via-[#C6A15B] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Footer strip */}
            <footer className="border-t border-[#C6A15B]/30 mt-4">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col items-center sm:items-start gap-2">
                        <p className="font-['Fraunces',serif] text-lg text-[#181410]">{store.storeName}</p>
                        <div className="flex items-center justify-center sm:justify-start">
                            <StoreSocialLinks
                                facebookUrl={store.facebookUrl}
                                instagramUrl={store.instagramUrl}
                                whatsappNumber={store.whatsappNumber}
                            />
                        </div>
                    </div>
                    <p className="font-['IBM_Plex_Mono'] text-[11px] tracking-[0.18em] uppercase text-[#75705F]">
                        Powered by Vendoo
                    </p>
                </div>
            </footer>
        </div>
    );
}