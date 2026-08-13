import CartIcon from "@/components/storefront/CartIcon";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";


interface Product {
    _id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
}

interface Store {
    storeName: string;
    logo?: string;
}

async function getStoreData(subdomain: string) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

    const [storeRes, productsRes] = await Promise.all([
        fetch(`${baseUrl}/tenant/store`, {
            headers: { "X-Tenant-Subdomain": subdomain },
            cache: "no-store",
        }),
        fetch(`${baseUrl}/tenant/products`, {
            headers: { "X-Tenant-Subdomain": subdomain },
            cache: "no-store",
        }),
    ]);

    if (!storeRes.ok || !productsRes.ok) {
        return null;
    }

    const storeData = await storeRes.json();
    const productsData = await productsRes.json();

    return {
        store: storeData.store as Store,
        products: productsData.products as Product[],
    };
}

export default async function StorePage({
    params,
}: {
    params: Promise<{ subdomain: string }>;
}) {
    const { subdomain } = await params;
    const data = await getStoreData(subdomain);

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F6F3EC]">
                <div className="text-center px-6">
                    <p className="font-['IBM_Plex_Mono'] text-xs tracking-widest uppercase text-[#8B8F82] mb-3">
                        404 / NOT FOUND
                    </p>
                    <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-[#1B1E19] mb-2">
                        এই দোকানটি খুঁজে পাওয়া যায়নি
                    </h1>
                    <p className="text-[#8B8F82]">স্টোরটি বন্ধ আছে অথবা এই ঠিকানায় কোনো দোকান নেই।</p>
                </div>
            </div>
        );
    }

    const { store, products } = data;

    return (
        <div className="min-h-screen bg-[#F6F3EC]">
            {/* Header — শপ ব্যানার */}
            <StorefrontHeader variant="home" storeName={store.storeName} storeLogo={store.logo} />

            {/* Product Grid */}
            <main className="max-w-6xl mx-auto px-6 py-10">
                <p className="font-['IBM_Plex_Mono'] text-xs tracking-widest uppercase text-[#8B8F82] mb-6">
                    Shop · {products.length} {products.length === 1 ? "item" : "items"}
                </p>

                {products.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="font-['Space_Grotesk'] text-xl font-bold text-[#1B1E19] mb-2">
                            শেলফ এখনো খালি
                        </p>
                        <p className="text-[#8B8F82] text-sm">এই দোকানে এখনো কোনো প্রোডাক্ট যোগ করা হয়নি।</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => {
                            const outOfStock = product.stock === 0;
                            return (
                                <a
                                    key={product._id}
                                    href={`/product/${product._id}`}
                                    className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#274B3B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6F3EC] rounded-lg"
                                >
                                    <div className="relative bg-white rounded-lg overflow-hidden border border-[#1B1E19]/8 transition-shadow duration-200 group-hover:shadow-md">
                                        {/* Image */}
                                        <div className="relative aspect-square overflow-hidden bg-[#EFECE3]">
                                            <img
                                                src={product.images[0] || "/placeholder.png"}
                                                alt={product.name}
                                                className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                                                    outOfStock ? "grayscale opacity-60" : ""
                                                }`}
                                            />
                                            {outOfStock && (
                                                <div className="absolute top-2.5 left-2.5 bg-[#1B1E19] text-[#F6F3EC] font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-wider px-2 py-1 rounded">
                                                    স্টক নেই
                                                </div>
                                            )}

                                            {/* Signature: hanging price tag */}
                                            {!outOfStock && (
                                                <div
                                                    className="absolute -bottom-1 -right-1 bg-[#E7A23D] text-[#1B1E19] font-['IBM_Plex_Mono'] font-medium text-xs px-3 py-1.5 shadow-sm"
                                                    style={{
                                                        clipPath:
                                                            "polygon(12px 0, 100% 0, 100% 100%, 12px 100%, 0 50%)",
                                                    }}
                                                >
                                                    ৳{product.price}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="p-3">
                                            <h3 className="font-medium text-sm text-[#1B1E19] truncate">
                                                {product.name}
                                            </h3>
                                        </div>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}