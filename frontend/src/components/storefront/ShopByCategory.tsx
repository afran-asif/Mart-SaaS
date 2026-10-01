import Link from "next/link";
import { isDarkTheme, isLuxeTheme } from "@/lib/storeTheme";

interface Category {
    name: string;
    productCount: number;
    thumbnail?: string | null;
}

interface ShopByCategoryProps {
    categories: Category[];
    brand?: string;
    theme?: string;
}

export default function ShopByCategory({
    categories,
    brand = "#F4501A",
    theme = "classic",
}: ShopByCategoryProps) {
    if (!categories || categories.length === 0) return null;

    const isDark = isDarkTheme(theme);
    const isLuxe = isLuxeTheme(theme);

    return (
        <section className={`py-8 sm:py-10 ${isDark ? "" : ""}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Section heading */}
                <h2
                    className="text-center text-xl sm:text-2xl font-bold mb-6 sm:mb-8 tracking-tight"
                    style={{ color: brand }}
                >
                    Shop By Category
                </h2>

                {/* Wrap row — mobile-এ sideways swipe নেই */}
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                    {categories.map((cat) => (
                        <Link
                            key={cat.name}
                            href={`/category/${encodeURIComponent(cat.name)}`}
                            className={`flex-shrink-0 flex flex-col items-center gap-2 group`}
                        >
                            {/* Image card */}
                            <div
                                className={`w-[88px] h-[88px] sm:w-[100px] sm:h-[100px] rounded-2xl overflow-hidden border transition-all duration-200 group-hover:shadow-lg group-hover:scale-[1.04] active:scale-95 ${
                                    isDark
                                        ? "border-white/10 bg-white/5"
                                        : "border-gray-200 bg-gray-50"
                                }`}
                            >
                                {cat.thumbnail ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                        src={cat.thumbnail}
                                        alt={cat.name}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                ) : (
                                    /* Fallback: category initial letter */
                                    <div
                                        className="w-full h-full flex items-center justify-center text-2xl font-bold"
                                        style={{ backgroundColor: `${brand}18`, color: brand }}
                                    >
                                        {cat.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Category name */}
                            <span
                                className={`text-xs sm:text-[13px] font-medium text-center max-w-[88px] sm:max-w-[100px] leading-snug truncate ${
                                    isLuxe
                                        ? "text-[#d4af37]"
                                        : isDark
                                        ? "text-gray-300"
                                        : "text-gray-700"
                                } group-hover:opacity-75 transition-opacity`}
                            >
                                {cat.name.length > 11 ? cat.name.slice(0, 9) + "..." : cat.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
