"use client";

import Link from "next/link";
import { useRef } from "react";

interface Product { _id: string; name: string; price: number; images: string[]; stock: number; }

export default function FeaturedSlider({ products, brand }: { products: Product[]; brand: string }) {
    const ref = useRef<HTMLDivElement>(null);

    const scroll = (dir: "left" | "right") => {
        if (!ref.current) return;
        const w = ref.current.clientWidth * 0.85;
        ref.current.scrollBy({ left: dir === "left" ? -w : w, behavior: "smooth" });
    };

    if (products.length === 0) return null;

    // single product -> centered, no slider
    if (products.length === 1) {
        const p = products[0];
        const out = p.stock === 0;
        return (
            <div className="flex justify-center">
                <Link href={`/product/${p._id}`} className="group relative w-[85%] max-w-[360px] rounded-2xl overflow-hidden">
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#F4EEE2]">
                        <img src={p.images[0] || "/placeholder.png"} alt={p.name} loading="lazy" className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${out ? "grayscale" : ""}`} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        {out ? (
                            <div className="absolute top-3 left-3 bg-black/70 text-white text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur">Sold out</div>
                        ) : (
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-black text-[11px] font-bold px-2.5 py-1 rounded-full">★ Featured</div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="font-['Fraunces',serif] text-white font-semibold text-base leading-tight truncate drop-shadow">{p.name}</h3>
                            <p className="text-white/90 text-sm font-medium mt-1">৳{p.price}</p>
                        </div>
                    </div>
                </Link>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* arrows - desktop only */}
            <button
                onClick={() => scroll("left")}
                aria-label="Previous"
                className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-9 h-9 rounded-full bg-white border border-black/10 shadow-lg items-center justify-center hover:bg-gray-50"
            >
                ‹
            </button>
            <button
                onClick={() => scroll("right")}
                aria-label="Next"
                className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-9 h-9 rounded-full bg-white border border-black/10 shadow-lg items-center justify-center hover:bg-gray-50"
            >
                ›
            </button>

            <div
                ref={ref}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
            >
                {products.map((p) => {
                    const out = p.stock === 0;
                    return (
                        <Link
                            key={p._id}
                            href={`/product/${p._id}`}
                            className="group relative flex-shrink-0 w-[72%] sm:w-[280px] snap-center rounded-2xl overflow-hidden"
                        >
                            <div className="relative aspect-[4/5] overflow-hidden bg-[#F4EEE2]">
                                <img
                                    src={p.images[0] || "/placeholder.png"}
                                    alt={p.name}
                                    loading="lazy"
                                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${out ? "grayscale" : ""}`}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                                {out && (
                                    <div className="absolute top-3 left-3 bg-black/70 text-white text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur">
                                        Sold out
                                    </div>
                                )}
                                {!out && (
                                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-black text-[11px] font-bold px-2.5 py-1 rounded-full">
                                        ★ Featured
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <h3 className="font-['Fraunces',serif] text-white font-semibold text-base leading-tight truncate drop-shadow">
                                        {p.name}
                                    </h3>
                                    <p className="text-white/90 text-sm font-medium mt-1">৳{p.price}</p>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
            <style>{`div::-webkit-scrollbar{display:none}`}</style>
        </div>
    );
}