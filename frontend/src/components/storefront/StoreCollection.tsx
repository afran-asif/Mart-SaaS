import Link from "next/link";
import { ClassicTheme } from "./themes/ClassicTheme";
import { MinimalTheme } from "./themes/MinimalTheme";
import { BoldTheme } from "./themes/BoldTheme";
import { ElegantTheme } from "./themes/ElegantTheme";
import { VibrantTheme } from "./themes/VibrantTheme";
import { RetroTheme } from "./themes/RetroTheme";
import { LuxeTheme } from "./themes/LuxeTheme";
import { PastelTheme } from "./themes/PastelTheme";
import { UrbanTheme } from "./themes/UrbanTheme";

interface Product {
    _id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
    featured?: boolean;
    category?: string;
}

interface Category {
    name: string;
    productCount: number;
}

interface StoreGridProps {
    products: Product[];
    theme: string;
    brand: string;
}

export function StoreGrid({ products, theme, brand }: StoreGridProps) {
    switch (theme) {
        case "minimal": return <MinimalTheme products={products} brand={brand} />;
        case "bold": return <BoldTheme products={products} brand={brand} />;
        case "elegant": return <ElegantTheme products={products} brand={brand} />;
        case "vibrant": return <VibrantTheme products={products} brand={brand} />;
        case "retro": return <RetroTheme products={products} brand={brand} />;
        case "luxe": return <LuxeTheme products={products} brand={brand} />;
        case "pastel": return <PastelTheme products={products} brand={brand} />;
        case "urban": return <UrbanTheme products={products} brand={brand} />;
        default: return <ClassicTheme products={products} brand={brand} />;
    }
}

interface StoreCollectionProps {
    products: Product[];
    categories: Category[];
    theme: string;
    brand: string;
    title?: string;
    activeCategory?: string | null;
}

export default function StoreCollection({ products, categories, theme, brand, title, activeCategory = null }: StoreCollectionProps) {
    const isDark = theme === "bold" || theme === "luxe";
    const isLuxe = theme === "luxe";

    return (
        <>
            <div className="mb-7 sm:mb-9">
                <p className={`font-['IBM_Plex_Mono'] text-[11px] tracking-[0.2em] uppercase mb-2 ${isLuxe ? "text-[#d4af37]/70" : isDark ? "text-white/60" : "text-[#C6A15B]"}`}>
                    Curated for you · {products.length} {products.length === 1 ? "item" : "items"}
                </p>
                <div className="flex items-end justify-between gap-4">
                    <h2 className={`font-['Fraunces',serif] text-3xl sm:text-4xl font-semibold tracking-tight ${isLuxe ? "text-[#d4af37]" : isDark ? "text-white" : "text-[#181410]"}`}>
                        {title || "Shop the collection"}
                    </h2>
                    <span className="hidden sm:block h-px flex-1 mb-3 bg-gradient-to-r from-[#C6A15B]/60 to-transparent" />
                </div>

                {/* Category pills — SEO-friendly links, wrap, no sideways swipe */}
                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-5">
                        <Link
                            href="/#collection"
                            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                                !activeCategory
                                    ? "text-white shadow-md"
                                    : isDark
                                    ? "bg-white/10 text-white/70 hover:bg-white/15"
                                    : "bg-[#181410]/5 text-[#181410]/70 hover:bg-[#181410]/10"
                            }`}
                            style={!activeCategory ? { background: brand } : undefined}
                        >
                            All
                        </Link>
                        {categories.map((c) => {
                            const active = activeCategory?.toLowerCase() === c.name.toLowerCase();
                            return (
                                <Link
                                    key={c.name}
                                    href={`/category/${encodeURIComponent(c.name)}`}
                                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                                        active
                                            ? "text-white shadow-md"
                                            : isDark
                                            ? "bg-white/10 text-white/70 hover:bg-white/15"
                                            : "bg-[#181410]/5 text-[#181410]/70 hover:bg-[#181410]/10"
                                    }`}
                                    style={active ? { background: brand } : undefined}
                                >
                                    {c.name}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {products.length === 0 && activeCategory ? (
                <div className="py-20 text-center">
                    <p className={`font-['Fraunces',serif] text-2xl font-semibold mb-2 ${isLuxe ? "text-[#d4af37]" : isDark ? "text-white" : "text-[#181410]"}`}>
                        এই ক্যাটাগরিতে কিছু নেই
                    </p>
                    <Link
                        href="/#collection"
                        className="text-sm font-semibold hover:underline underline-offset-4"
                        style={{ color: brand }}
                    >
                        সব প্রোডাক্ট দেখুন →
                    </Link>
                </div>
            ) : (
                <StoreGrid products={products} theme={theme} brand={brand} />
            )}
        </>
    );
}
