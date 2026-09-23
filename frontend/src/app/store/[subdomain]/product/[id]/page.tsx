import AddToCartButton from "@/components/storefront/AddToCartButton";
import CartIcon from "@/components/storefront/CartIcon";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";
import TrackViewContent from "@/components/storefront/TrackViewContent";
import type { Metadata } from "next";

interface Product {
    _id: string;
    name: string;
    price: number;
    description: string;
    category: string;
    images: string[];
    stock: number;
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ subdomain: string; id: string }>;
}): Promise<Metadata> {
    const { subdomain, id } = await params;
    const product = await getProduct(subdomain, id);

    if (!product) {
        return { title: "Product Not Found" };
    }

    return {
        title: `${product.name} - ৳${product.price}`,
        description: product.description?.slice(0, 150) || `${product.name} কিনুন সেরা দামে`,
        openGraph: {
            title: product.name,
            description: product.description?.slice(0, 150),
            images: product.images?.length ? [product.images[0]] : [],
        },
    };
}

async function getProduct(subdomain: string, id: string): Promise<Product | null> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

    const res = await fetch(`${baseUrl}/tenant/products/${id}`, {
        headers: { "X-Tenant-Subdomain": subdomain },
        cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.product as Product;
}

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ subdomain: string; id: string }>;
}) {
    const { subdomain, id } = await params;
    const product = await getProduct(subdomain, id);

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7]">
                <div className="text-center px-6">
                    <p className="font-['IBM_Plex_Mono'] text-xs tracking-[0.2em] uppercase text-[#75705F] mb-3">
                        404 / NOT FOUND
                    </p>
                    <h1 className="font-['Fraunces',serif] text-3xl font-semibold text-[#181410] mb-2 tracking-tight">
                        প্রোডাক্টটি খুঁজে পাওয়া যায়নি
                    </h1>
                    <a
                        href="/"
                        className="inline-block mt-4 text-sm text-[#0E3B2C] font-medium underline underline-offset-4 hover:text-[#F4501A] transition-colors"
                    >
                        দোকানে ফিরে যান
                    </a>
                </div>
            </div>
        );
    }

    const outOfStock = product.stock === 0;
    const lowStock = !outOfStock && product.stock <= 5;

    return (
        <div className="min-h-screen bg-[#FFFDF7]">
            {/* সিম্পল হেডার — ব্যাক লিংক সহ */}
            <StorefrontHeader variant="sub" />

            {/* E-commerce ViewContent Tracking (Meta, TikTok, GA) */}
            <TrackViewContent
                product={{
                    id: product._id,
                    name: product.name,
                    price: product.price,
                }}
            />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
                    {/* বাম পাশ — ছবি */}
                    <div>
                        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#F4EEE2] border border-[#181410]/10 shadow-[0_24px_50px_-24px_rgba(24,20,16,0.3)]">
                            <img
                                src={product.images[0] || "/placeholder.png"}
                                alt={product.name}
                                className={`w-full h-full object-cover ${outOfStock ? "grayscale opacity-60" : ""}`}
                            />
                            {outOfStock ? (
                                <div className="absolute top-4 left-4 bg-[#181410] text-[#FFFDF7] font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.14em] px-3 py-1.5 rounded-full">
                                    স্টক নেই
                                </div>
                            ) : (
                                <div className="absolute top-4 left-4 bg-[#FFFDF7]/95 backdrop-blur text-[#0E3B2C] font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.14em] px-3 py-1.5 rounded-full border border-[#C6A15B]/50">
                                    Premium pick
                                </div>
                            )}
                        </div>

                        {/* একাধিক ছবি থাকলে থাম্বনেইল */}
                        {product.images.length > 1 && (
                            <div className="flex gap-3 mt-4">
                                {product.images.map((img, i) => (
                                    <div
                                        key={i}
                                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#F4EEE2] border-2 transition-colors ${
                                            i === 0 ? "border-[#C6A15B]" : "border-transparent hover:border-[#C6A15B]/60"
                                        }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ডান পাশ — তথ্য */}
                    <div className="flex flex-col">
                        <p className="font-['IBM_Plex_Mono'] text-[11px] tracking-[0.2em] uppercase text-[#C6A15B] mb-3">
                            {product.category}
                        </p>
                        <h1 className="font-['Fraunces',serif] text-3xl sm:text-[2.75rem] font-semibold text-[#181410] mb-4 leading-[1.1] tracking-tight">
                            {product.name}
                        </h1>

                        <div className="flex items-baseline gap-3 mb-6">
                            <p className="font-['Fraunces',serif] text-3xl sm:text-4xl font-semibold text-[#0E3B2C]">
                                ৳{product.price}
                            </p>
                            <span className="font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-wider text-[#75705F]">
                                BDT
                            </span>
                        </div>

                        <span className="h-px w-16 bg-[#C6A15B] mb-6" />

                        <p className="text-[#181410]/75 leading-relaxed mb-8 whitespace-pre-line text-[15px]">
                            {product.description}
                        </p>

                        {/* স্টক স্ট্যাটাস */}
                        <div className="mb-7">
                            {outOfStock ? (
                                <p className="inline-flex items-center gap-2 text-sm text-red-600 font-medium bg-red-50 border border-red-100 rounded-full px-3.5 py-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    এই মুহূর্তে স্টকে নেই
                                </p>
                            ) : lowStock ? (
                                <p className="inline-flex items-center gap-2 text-sm text-[#D63F0F] font-medium bg-[#F4501A]/8 border border-[#F4501A]/20 rounded-full px-3.5 py-1.5">
                                    <span className="relative flex w-1.5 h-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F4501A] opacity-60" />
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#F4501A]" />
                                    </span>
                                    মাত্র {product.stock}টি বাকি — দ্রুত অর্ডার করুন
                                </p>
                            ) : (
                                <p className="inline-flex items-center gap-2 text-sm text-[#0E3B2C] font-medium bg-[#0E3B2C]/5 border border-[#0E3B2C]/15 rounded-full px-3.5 py-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1F9D55]" />
                                    স্টকে আছে
                                </p>
                            )}
                        </div>

                        <AddToCartButton product={product}/>

                        {/* Trust badges */}
                        {!outOfStock && (
                            <div className="grid grid-cols-2 gap-3 mt-7">
                                <div className="flex items-center gap-2.5 bg-white border border-[#181410]/10 rounded-xl px-3.5 py-3">
                                    <span className="w-8 h-8 rounded-full bg-[#0E3B2C]/8 flex items-center justify-center text-sm shrink-0">💵</span>
                                    <p className="text-xs font-medium text-[#181410] leading-snug">ক্যাশ অন ডেলিভারি</p>
                                </div>
                                <div className="flex items-center gap-2.5 bg-white border border-[#181410]/10 rounded-xl px-3.5 py-3">
                                    <span className="w-8 h-8 rounded-full bg-[#0E3B2C]/8 flex items-center justify-center text-sm shrink-0">🔒</span>
                                    <p className="text-xs font-medium text-[#181410] leading-snug">নিরাপদ অনলাইন পেমেন্ট</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}