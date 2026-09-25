import Link from "next/link";

interface Product { _id: string; name: string; price: number; images: string[]; stock: number; featured?: boolean; }

export function ClassicTheme({ products, brand }: { products: Product[]; brand: string }) {
    if (products.length === 0) return <div className="py-20 text-center"><p className="font-['Fraunces',serif] text-2xl font-semibold text-[#181410] mb-2">শেলফ এখনো খালি</p><p className="text-[#75705F] text-sm">এই দোকানে এখনো কোনো প্রোডাক্ট যোগ করা হয়নি।</p></div>;
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-7">
            {products.map((p) => {
                const out = p.stock === 0;
                return (
                    <Link key={p._id} href={`/product/${p._id}`} className="group block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4501A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFDF7]">
                        <div className="relative bg-white rounded-2xl overflow-hidden border border-[#181410]/10 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_20px_40px_-16px_rgba(24,20,16,0.25)]">
                            <div className="relative aspect-[4/5] overflow-hidden bg-[#F4EEE2]">
                                <img src={p.images[0] || "/placeholder.png"} alt={p.name} loading="lazy" className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06] ${out ? "grayscale opacity-60" : ""}`} />
                                {out && <div className="absolute top-3 left-3 bg-[#181410] text-[#FFFDF7] font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.14em] px-2.5 py-1 rounded-full">স্টক নেই</div>}
                                {!out && <div className="absolute bottom-3 right-3 text-white font-['IBM_Plex_Mono'] font-medium text-xs px-3 py-1.5 rounded-full shadow-lg" style={{ background: brand }}>৳{p.price}</div>}
                            </div>
                            <div className="p-3.5 sm:p-4">
                                <h3 className="font-['Fraunces',serif] font-medium text-[15px] sm:text-base text-[#181410] truncate leading-snug">{p.name}</h3>
                                <p className="font-['IBM_Plex_Mono'] text-[11px] tracking-wider uppercase text-[#75705F] mt-1">৳{p.price} · {out ? "Out of stock" : "In stock"}</p>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}