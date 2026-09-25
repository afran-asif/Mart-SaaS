import Link from "next/link";

interface Product { _id: string; name: string; price: number; images: string[]; stock: number; }

export function LuxeTheme({ products, brand }: { products: Product[]; brand: string }) {
    if (products.length === 0) return <div className="py-20 text-center"><p className="text-2xl font-serif text-[#d4af37]">Luxe Collection — Coming Soon</p><p className="text-sm text-white/60 mt-1">Premium curation awaits.</p></div>;
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => {
                const out = p.stock === 0;
                return (
                    <Link key={p._id} href={`/product/${p._id}`} className="group block">
                        <div className="bg-[#111] rounded-xl overflow-hidden border border-[#d4af37]/30 group-hover:border-[#d4af37]/60 transition-colors">
                            <div className="aspect-[4/5] overflow-hidden bg-[#1a1a1a]">
                                <img src={p.images[0] || "/placeholder.png"} alt={p.name} className={`w-full h-full object-cover group-hover:scale-105 transition-transform ${out ? "grayscale opacity-40" : ""}`} />
                            </div>
                            <div className="p-4 text-center">
                                <h3 className="font-serif text-sm text-[#d4af37] truncate">{p.name}</h3>
                                <p className="text-xs tracking-[0.2em] uppercase text-[#d4af37]/70 mt-1">৳{p.price}</p>
                                <div className="mt-2 h-px w-12 mx-auto bg-[#d4af37]/40" />
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}