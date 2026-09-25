import Link from "next/link";

interface Product { _id: string; name: string; price: number; images: string[]; stock: number; }

export function PastelTheme({ products, brand }: { products: Product[]; brand: string }) {
    if (products.length === 0) return <div className="py-20 text-center"><p className="text-2xl font-light text-[#a78bfa]">Pastel dreams — No products yet</p><p className="text-sm text-gray-400 mt-1">Soft hues coming soon.</p></div>;
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => {
                const out = p.stock === 0;
                return (
                    <Link key={p._id} href={`/product/${p._id}`} className="group block">
                        <div className="bg-white rounded-2xl overflow-hidden border border-pink-100 group-hover:border-pink-200 transition-colors shadow-sm group-hover:shadow-md">
                            <div className="aspect-square overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
                                <img src={p.images[0] || "/placeholder.png"} alt={p.name} className={`w-full h-full object-cover group-hover:scale-105 transition-transform ${out ? "grayscale opacity-50" : ""}`} />
                            </div>
                            <div className="p-3.5">
                                <h3 className="text-sm font-medium text-gray-700 truncate">{p.name}</h3>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-sm font-bold" style={{ color: brand }}>৳{p.price}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-pink-50 text-pink-600">{out ? "Out" : "Stock"}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}