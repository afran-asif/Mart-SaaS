import Link from "next/link";

interface Product { _id: string; name: string; price: number; images: string[]; stock: number; }

export function MinimalTheme({ products, brand }: { products: Product[]; brand: string }) {
    if (products.length === 0) return <div className="py-20 text-center"><p className="text-xl font-semibold text-gray-900">No products yet</p><p className="text-sm text-gray-500 mt-1">This store has not added any products.</p></div>;
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => {
                const out = p.stock === 0;
                return (
                    <Link key={p._id} href={`/product/${p._id}`} className="group block">
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
                            <div className="aspect-square overflow-hidden bg-gray-50">
                                <img src={p.images[0] || "/placeholder.png"} alt={p.name} className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${out ? "grayscale opacity-50" : ""}`} />
                            </div>
                            <div className="p-3">
                                <h3 className="text-sm font-medium text-gray-900 truncate">{p.name}</h3>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-sm font-bold text-gray-900">৳{p.price}</span>
                                    <span className="text-[11px] px-2 py-0.5 rounded-full border" style={{ borderColor: brand, color: brand }}>{out ? "Out" : "Stock"}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}