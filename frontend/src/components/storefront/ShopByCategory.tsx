"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
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

const STEP_MS = 2800;

export default function ShopByCategory({
    categories,
    brand = "#F4501A",
    theme = "classic",
}: ShopByCategoryProps) {
    const [startIndex, setStartIndex] = useState(0);
    const [wide, setWide] = useState(false);

    const isDark = isDarkTheme(theme);
    const isLuxe = isLuxeTheme(theme);
    const n = categories?.length || 0;

    // responsive visible slots — PC 5, mobile 3
    useEffect(() => {
        const mq = window.matchMedia("(min-width: 640px)");
        const update = () => setWide(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);

    const K = Math.min(n, 3);
    const center = Math.floor(K / 2);
    const rotating = n > K;

    // একটা একটা করে left-এ ঘোরা, loop — hover/touch-এও থামে না
    useEffect(() => {
        if (!rotating) return;
        if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const id = setInterval(() => {
            setStartIndex((s) => (s + 1) % n);
        }, STEP_MS);
        return () => clearInterval(id);
    }, [n, rotating]);

    if (n === 0) return null;

    const renderCard = (cat: Category, extra?: string) => (
        <Link
            href={`/category/${encodeURIComponent(cat.name)}`}
            className={`flex flex-col items-center gap-2 group ${extra || ""}`}
        >
            {/* Image card */}
<div
                    className={`w-[88px] h-[88px] sm:w-[128px] sm:h-[128px] rounded-2xl overflow-hidden border transition-all duration-200 group-hover:shadow-lg group-hover:scale-[1.04] active:scale-95 ${
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
                    className={`text-xs sm:text-[13px] font-medium text-center max-w-[88px] sm:max-w-[128px] leading-snug truncate ${
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
    );

    return (
        <section className="py-8 sm:py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Section heading */}
                <h2
                    className="text-center text-xl sm:text-2xl font-bold mb-6 sm:mb-8 tracking-tight"
                    style={{ color: brand }}
                >
                    Shop By Category
                </h2>

                {!rotating ? (
                    /* সব fit হলে static center row */
                    <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                        {categories.map((cat) => (
                            <div key={cat.name}>{renderCard(cat)}</div>
                        ))}
                    </div>
                ) : (
                    /* Coverflow — same DOM slide করে, loop-এ teleport invisible */
                    <div className="relative mx-auto h-[140px] sm:h-[184px] max-w-full overflow-hidden">
                        {categories.map((cat, i) => {
                            const rel = (((i - startIndex) % n) + n) % n;
                            let off: number;
                            let hidden = false;
                            if (rel <= center) {
                                off = rel;
                            } else if (rel >= n - center) {
                                off = rel - n;
                            } else {
                                off = center + 1;
                                hidden = true;
                            }
                            const abs = Math.abs(off);
                            const style: React.CSSProperties = {
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                transform: `translate(calc(-50% + ${off * (wide ? 144 : 100)}px), -50%) scale(${hidden ? 0.74 : abs === 0 ? 1.05 : abs === 1 ? 0.9 : 0.74})`,
                                opacity: hidden ? 0 : abs === 0 ? 1 : abs === 1 ? 0.85 : 0.55,
                                filter: hidden || abs !== 0 ? "grayscale(0.45)" : "grayscale(0)",
                                zIndex: hidden ? 0 : 10 - abs,
                                pointerEvents: hidden ? "none" : "auto",
                                transition: "transform 0.7s ease-in-out, opacity 0.7s ease-in-out, filter 0.7s ease-in-out",
                            };
                            return (
                                <div key={cat.name} style={style}>
                                    {renderCard(cat)}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
