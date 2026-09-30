"use client";

import { useState } from "react";
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

interface StoreCollectionProps {
    products: Product[];
    categories: Category[];
    theme: string;
    brand: string;
}

export default function StoreCollection({ products, categories, theme, brand }: StoreCollectionProps) {
    const [selected, setSelected] = useState("All");
    const isDark = theme === "bold" || theme === "luxe";
    const isLuxe = theme === "luxe";

    const filtered =
        selected === "All"
            ? products
            : products.filter((p) => (p.category || "General").toLowerCase() === selected.toLowerCase());

    const renderGrid = (items: Product[]) => {
        switch (theme) {
            case "minimal": return <MinimalTheme products={items} brand={brand} />;
            case "bold": return <BoldTheme products={items} brand={brand} />;
            case "elegant": return <ElegantTheme products={items} brand={brand} />;
            case "vibrant": return <VibrantTheme products={items} brand={brand} />;
            case "retro": return <RetroTheme products={items} brand={brand} />;
            case "luxe": return <LuxeTheme products={items} brand={brand} />;
            case "pastel": return <PastelTheme products={items} brand={brand} />;
            case "urban": return <UrbanTheme products={items} brand={brand} />;
            default: return <ClassicTheme products={items} brand={brand} />;
        }
    };

    return (
        <>
            <div className="mb-7 sm:mb-9">
                <p className={`font-['IBM_Plex_Mono'] text-[11px] tracking-[0.2em] uppercase mb-2 ${isLuxe ? "text-[#d4af37]/70" : isDark ? "text-white/60" : "text-[#C6A15B]"}`}>
                    Curated for you · {filtered.length} {filtered.length === 1 ? "item" : "items"}
                </p>
                <div className="flex items-end justify-between gap-4">
                    <h2 className={`font-['Fraunces',serif] text-3xl sm:text-4xl font-semibold tracking-tight ${isLuxe ? "text-[#d4af37]" : isDark ? "text-white" : "text-[#181410]"}`}>
                        Shop the collection
                    </h2>
                    <span className="hidden sm:block h-px flex-1 mb-3 bg-gradient-to-r from-[#C6A15B]/60 to-transparent" />
                </div>

                {/* Category pills — wrap, no sideways swipe */}
                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-5">
                        <button
                            onClick={() => setSelected("All")}
                            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all touch-manipulation active:scale-95 ${
                                selected === "All"
                                    ? "text-white shadow-md"
                                    : isDark
                                    ? "bg-white/10 text-white/70 hover:bg-white/15"
                                    : "bg-[#181410]/5 text-[#181410]/70 hover:bg-[#181410]/10"
                            }`}
                            style={selected === "All" ? { background: brand } : undefined}
                        >
                            All
                        </button>
                        {categories.map((c) => {
                            const active = selected === c.name;
                            return (
                                <button
                                    key={c.name}
                                    onClick={() => setSelected(active ? "All" : c.name)}
                                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all touch-manipulation active:scale-95 ${
                                        active
                                            ? "text-white shadow-md"
                                            : isDark
                                            ? "bg-white/10 text-white/70 hover:bg-white/15"
                                            : "bg-[#181410]/5 text-[#181410]/70 hover:bg-[#181410]/10"
                                    }`}
                                    style={active ? { background: brand } : undefined}
                                >
                                    {c.name}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {selected !== "All" && filtered.length === 0 ? (
                <div className="py-20 text-center">
                    <p className={`font-['Fraunces',serif] text-2xl font-semibold mb-2 ${isLuxe ? "text-[#d4af37]" : isDark ? "text-white" : "text-[#181410]"}`}>
                        এই ক্যাটাগরিতে কিছু নেই
                    </p>
                    <button
                        onClick={() => setSelected("All")}
                        className="text-sm font-semibold hover:underline underline-offset-4"
                        style={{ color: brand }}
                    >
                        সব প্রোডাক্ট দেখুন →
                    </button>
                </div>
            ) : (
                renderGrid(filtered)
            )}
        </>
    );
}
