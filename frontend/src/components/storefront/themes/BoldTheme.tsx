import Link from "next/link";

interface Product { _id: string; name: string; price: number; images: string[]; stock: number; }

export function BoldTheme({ products, brand }: { products: Product[]; brand: string }) {
    if (products.length === 0) return <div className="py-20 text-center"><p className="text-2xl font-black text-white">EMPTY SHELF</p><p className="text-sm text-white/60 mt-1">No products added yet.</p></div>;
    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {products.map((p) => {
                const out = p.stock === 0;
                return (
                    <Link key={p._id} href={`/product/${p._id}`} className="group block">
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden group-hover:border-white/20 transition-colors">
                            <div className="aspect-[4/3] overflow-hidden bg-[#222]">
                                <img src={p.images[0] || "/placeholder.png"} alt={p.name} className={`w-full h-full object-cover group-hover:scale-105 transition-transform ${out ? "grayscale opacity-40" : ""}`} />
                            </div>
                            <div className="p-4">
                                <h3 className="text-base font-black uppercase tracking-wide text-white truncate">{p.name}</h3>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-lg font-black" style={{ color: brand }}>৳{p.price}</span>
                                    <span className="text-xs font-mono uppercase text-white/50">{out ? "Sold out" : "In Stock"}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}