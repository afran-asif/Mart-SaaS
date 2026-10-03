import Link from "next/link";

interface Product {
    _id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
    featured?: boolean;
    category?: string;
}

interface StoreListProps {
    products: Product[];
    theme: string;
    brand: string;
}

/** Line/list view — এক লাইনে image + name + price, customer grid/list switch করতে পারে */
export default function StoreList({ products, theme, brand }: StoreListProps) {
    const isDark = theme === "bold" || theme === "luxe";
    const isLuxe = theme === "luxe";

    if (products.length === 0) {
        return (
            <p className={`py-10 text-center text-sm ${isDark ? "text-white/50" : "text-[#75705F]"}`}>
                কোনো প্রোডাক্ট নেই
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {products.map((p, i) => {
                const out = p.stock === 0;
                return (
                    <Link
                        key={p._id}
                        href={`/product/${p._id}`}
                        className={`group flex items-center gap-3 sm:gap-4 rounded-2xl border p-3 sm:p-4 transition-all active:scale-[0.99] hover:shadow-[0_14px_30px_-18px_rgba(24,20,16,0.35)] ${
                            i % 2 === 1 ? (isDark ? "bg-white/[0.03]" : "bg-[#181410]/[0.02]") : ""
                        } ${
                            isDark ? "border-white/10 bg-white/[0.02] hover:border-white/25" : "border-[#181410]/10 bg-white hover:border-[#181410]/25"
                        }`}
                    >
                        <span className="font-['IBM_Plex_Mono'] text-[11px] w-6 shrink-0 text-center tabular-nums opacity-40">
                            {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-[#F4EEE2] shrink-0">
                            <img
                                src={p.images?.[0] || "/placeholder.png"}
                                alt={p.name}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </span>
                        <span className="flex-1 min-w-0">
                            <span className={`block font-medium text-sm sm:text-base truncate leading-snug ${isLuxe ? "text-[#d4af37]" : isDark ? "text-white" : "text-[#181410]"}`}>
                                {p.name}
                            </span>
                            <span className={`block text-[11px] sm:text-xs mt-0.5 truncate ${isDark ? "text-white/50" : "text-[#75705F]"}`}>
                                {p.category || "General"}
                                {p.featured ? " · ★ Featured" : ""}
                            </span>
                            <span className={`inline-block mt-1.5 text-[10px] sm:text-[11px] font-semibold rounded-full px-2 py-0.5 ${out ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-600"}`}>
                                {out ? "স্টক নেই" : `স্টকে আছে${p.stock <= 5 ? ` · মাত্র ${p.stock}টি` : ""}`}
                            </span>
                        </span>
                        <span className="text-right shrink-0">
                            <span className={`block font-['IBM_Plex_Mono'] font-bold text-base sm:text-lg tabular-nums ${isLuxe ? "text-[#d4af37]" : isDark ? "text-white" : "text-[#0E3B2C]"}`}>
                                ৳{p.price.toLocaleString("en-IN")}
                            </span>
                            <span
                                className="inline-block mt-1.5 text-[11px] sm:text-xs font-bold rounded-lg px-3 py-1.5 text-white transition-transform group-hover:scale-105"
                                style={{ background: brand }}
                            >
                                দেখুন →
                            </span>
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}
