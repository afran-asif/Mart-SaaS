import Link from "next/link";

interface Product { _id: string; name: string; price: number; images: string[]; stock: number; }

export function ElegantTheme({ products, brand }: { products: Product[]; brand: string }) {
    if (products.length === 0) return <div className="py-20 text-center"><p className="font-serif text-2xl text-[#4a3f35]">Collection coming soon</p><p className="text-sm text-[#8a7d6b] mt-1">Curated pieces will appear here.</p></div>;
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => {
                const out = p.stock === 0;
                return (
                    <Link key={p._id} href={`/product/${p._id}`} className="group block">
                        <div className="bg-[#fdfbf7] rounded-xl overflow-hidden border border-[#e8e0d0] group-hover:shadow-lg group-hover:shadow-[#c9b99a]/20 transition-all">
                            <div className="aspect-[3/4] overflow-hidden bg-[#f5efe6]">
                                <img src={p.images[0] || "/placeholder.png"} alt={p.name} className={`w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ${out ? "grayscale opacity-50" : ""}`} />
                            </div>
                            <div className="p-4 text-center">
                                <h3 className="font-serif text-[15px] text-[#3a332a] truncate">{p.name}</h3>
                                <p className="text-xs tracking-widest uppercase text-[#8a7d6b] mt-1">৳{p.price}</p>
                                <div className="mt-2 h-px w-8 mx-auto" style={{ background: brand }} />
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}