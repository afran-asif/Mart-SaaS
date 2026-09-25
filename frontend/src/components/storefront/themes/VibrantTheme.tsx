import Link from "next/link";

interface Product { _id: string; name: string; price: number; images: string[]; stock: number; }

export function VibrantTheme({ products, brand }: { products: Product[]; brand: string }) {
    if (products.length === 0) return <div className="py-20 text-center"><p className="text-2xl font-bold">No products yet 🎨</p><p className="text-sm text-gray-500 mt-1">Add some colorful items!</p></div>;
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((p) => {
                const out = p.stock === 0;
                return (
                    <Link key={p._id} href={`/product/${p._id}`} className="group block">
                        <div className="rounded-3xl overflow-hidden border-2 bg-white group-hover:-translate-y-1 transition-transform shadow-sm group-hover:shadow-xl" style={{ borderColor: `${brand}30` }}>
                            <div className="aspect-square overflow-hidden" style={{ background: `linear-gradient(135deg, ${brand}15, #fff)` }}>
                                <img src={p.images[0] || "/placeholder.png"} alt={p.name} className={`w-full h-full object-cover group-hover:scale-105 transition-transform ${out ? "grayscale opacity-50" : ""}`} />
                            </div>
                            <div className="p-3.5">
                                <h3 className="font-bold text-sm text-gray-900 truncate">{p.name}</h3>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-sm font-black px-2.5 py-1 rounded-full text-white" style={{ background: brand }}>৳{p.price}</span>
                                    <span className="text-xs text-gray-500">{out ? "Out" : "In stock"}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}