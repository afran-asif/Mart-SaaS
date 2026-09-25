import Link from "next/link";

interface Product { _id: string; name: string; price: number; images: string[]; stock: number; }

export function RetroTheme({ products, brand }: { products: Product[]; brand: string }) {
    if (products.length === 0) return <div className="py-20 text-center"><p className="text-2xl font-bold text-[#8b4513]">Groovy — No products yet</p><p className="text-sm text-[#a0522d] mt-1">Vintage vibes coming soon.</p></div>;
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => {
                const out = p.stock === 0;
                return (
                    <Link key={p._id} href={`/product/${p._id}`} className="group block">
                        <div className="bg-[#fff8dc] rounded-xl overflow-hidden border-2 border-[#d2b48c] group-hover:border-[#8b4513] transition-colors">
                            <div className="aspect-[4/5] overflow-hidden bg-[#f5deb3]">
                                <img src={p.images[0] || "/placeholder.png"} alt={p.name} className={`w-full h-full object-cover sepia-[0.2] group-hover:sepia-0 transition-all ${out ? "grayscale opacity-50" : ""}`} />
                            </div>
                            <div className="p-3.5">
                                <h3 className="font-bold text-sm text-[#5d4037] truncate">{p.name}</h3>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-sm font-black px-2.5 py-1 rounded-full text-white" style={{ background: brand }}>৳{p.price}</span>
                                    <span className="text-[11px] font-mono uppercase text-[#8b4513]">{out ? "Sold" : "Available"}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}