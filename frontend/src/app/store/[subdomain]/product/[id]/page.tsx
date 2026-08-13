// app/store/[subdomain]/product/[id]/page.tsx
interface Product {
    _id: string;
    name: string;
    price: number;
    description: string;
    category: string;
    images: string[];
    stock: number;
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
            <div className="min-h-screen flex items-center justify-center bg-[#F6F3EC]">
                <div className="text-center px-6">
                    <p className="font-['IBM_Plex_Mono'] text-xs tracking-widest uppercase text-[#8B8F82] mb-3">
                        404 / NOT FOUND
                    </p>
                    <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-[#1B1E19] mb-2">
                        প্রোডাক্টটি খুঁজে পাওয়া যায়নি
                    </h1>
                    <a
                        href={`/store/${subdomain}`}
                        className="inline-block mt-4 text-sm text-[#274B3B] underline underline-offset-4"
                    >
                        দোকানে ফিরে যান
                    </a>
                </div>
            </div>
        );
    }

    const outOfStock = product.stock === 0;

    return (
        <div className="min-h-screen bg-[#F6F3EC]">
            {/* সিম্পল হেডার — ব্যাক লিংক সহ */}
            <header className="sticky top-0 z-10 bg-[#F6F3EC]/95 backdrop-blur-sm border-b border-[#1B1E19]/10">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <a
                        href="/"
                        className="inline-flex items-center gap-1.5 text-sm text-[#274B3B] font-medium hover:underline underline-offset-4"
                    >
                        ← দোকানে ফিরে যান
                    </a>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* বাম পাশ — ছবি */}
                    <div>
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-[#EFECE3] border border-[#1B1E19]/8">
                            <img
                                src={product.images[0] || "/placeholder.png"}
                                alt={product.name}
                                className={`w-full h-full object-cover ${outOfStock ? "grayscale opacity-60" : ""}`}
                            />
                            {outOfStock && (
                                <div className="absolute top-3 left-3 bg-[#1B1E19] text-[#F6F3EC] font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-wider px-2.5 py-1 rounded">
                                    স্টক নেই
                                </div>
                            )}
                        </div>

                        {/* একাধিক ছবি থাকলে থাম্বনেইল */}
                        {product.images.length > 1 && (
                            <div className="flex gap-3 mt-3">
                                {product.images.map((img, i) => (
                                    <div
                                        key={i}
                                        className="w-16 h-16 rounded-md overflow-hidden bg-[#EFECE3] border border-[#1B1E19]/8"
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ডান পাশ — তথ্য */}
                    <div>
                        <p className="font-['IBM_Plex_Mono'] text-xs tracking-widest uppercase text-[#8B8F82] mb-3">
                            {product.category}
                        </p>
                        <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-[#1B1E19] mb-4 leading-tight">
                            {product.name}
                        </h1>

                        <p className="font-['IBM_Plex_Mono'] text-2xl font-medium text-[#274B3B] mb-6">
                            ৳{product.price}
                        </p>

                        <p className="text-[#1B1E19]/80 leading-relaxed mb-8 whitespace-pre-line">
                            {product.description}
                        </p>

                        {/* স্টক স্ট্যাটাস */}
                        <div className="mb-6">
                            {outOfStock ? (
                                <p className="text-sm text-red-600 font-medium">এই মুহূর্তে স্টকে নেই</p>
                            ) : (
                                <p className="text-sm text-[#8B8F82]">
                                    স্টক আছে — {product.stock}টি বাকি
                                </p>
                            )}
                        </div>

                        {/* Add to Cart বাটন — এখনো ফাংশনাল না, পরের ধাপে যুক্ত হবে */}
                        <button
                            disabled={outOfStock}
                            className={`w-full py-3.5 rounded-lg font-medium text-sm transition-colors ${
                                outOfStock
                                    ? "bg-[#8B8F82]/20 text-[#8B8F82] cursor-not-allowed"
                                    : "bg-[#274B3B] text-[#F6F3EC] hover:bg-[#1F3D2F]"
                            }`}
                        >
                            {outOfStock ? "স্টক নেই" : "কার্টে যোগ করুন"}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}