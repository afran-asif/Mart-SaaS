import Link from "next/link";

interface Product { _id: string; name: string; price: number; images: string[]; stock: number; }

export function UrbanTheme({ products, brand }: { products: Product[]; brand: string }) {
    if (products.length === 0) return <div className="py-20 text-center"><p className="font-mono text-xl font-bold text-gray-900">URBAN // EMPTY</p><p className="text-xs font-mono text-gray-500 mt-1">No drops yet.</p></div>;
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map((p) => {
                const out = p.stock === 0;
                return (
                    <Link key={p._id} href={`/product/${p._id}`} className="group block">
                        <div className="bg-gray-100 rounded-none overflow-hidden border border-gray-300 group-hover:border-gray-900 transition-colors">
                            <div className="aspect-square overflow-hidden bg-gray-200">
                                <img src={p.images[0] || "/placeholder.png"} alt={p.name} className={`w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all ${out ? "grayscale opacity-40" : ""}`} />
                            </div>
                            <div className="p-3 bg-white">
                                <h3 className="font-mono text-xs font-bold uppercase tracking-wide text-gray-900 truncate">{p.name}</h3>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="font-mono text-sm font-bold" style={{ color: brand }}>৳{p.price}</span>
                                    <span className="font-mono text-[10px] uppercase bg-black text-white px-1.5 py-0.5">{out ? "Sold" : "Available"}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}