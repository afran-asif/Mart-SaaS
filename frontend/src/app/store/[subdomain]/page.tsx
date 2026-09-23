import CartIcon from "@/components/storefront/CartIcon";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";
import Link from "next/link";
import type { Metadata } from "next";

interface Product {
    _id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
}

interface Store {
    storeName: string;
    logo?: string;
    facebookPixelId?: string;
    googleAnalyticsId?: string;
    tiktokPixelId?: string;
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

    return (
        <div className="min-h-screen bg-[#FFFDF7]">
            {/* Header — শপ ব্যানার */}
            <StorefrontHeader variant="home" storeName={store.storeName} storeLogo={store.logo} />

            {/* Product Grid */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
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
                                                <div className="absolute bottom-3 right-3 bg-[#F4501A] text-white font-['IBM_Plex_Mono'] font-medium text-xs px-3 py-1.5 rounded-full shadow-lg shadow-[#F4501A]/30">
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
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="font-['Fraunces',serif] text-lg text-[#181410]">{store.storeName}</p>
                    <p className="font-['IBM_Plex_Mono'] text-[11px] tracking-[0.18em] uppercase text-[#75705F]">
                        Powered by Vendoo
                    </p>
                </div>
            </footer>
        </div>
    );
}