"use client";

import { useState, useRef } from "react";

interface ProductGalleryProps {
    images: string[];
    name: string;
    outOfStock: boolean;
}

export default function ProductGallery({ images, name, outOfStock }: ProductGalleryProps) {
    const imgs = images.length > 0 ? images : ["/placeholder.png"];
    const [index, setIndex] = useState(0);
    const touchX = useRef<number | null>(null);

    const goTo = (i: number) => setIndex(((i % imgs.length) + imgs.length) % imgs.length);

    // Mobile swipe — left/right slide e pic bodlabe
    const onTouchStart = (e: React.TouchEvent) => {
        touchX.current = e.touches[0].clientX;
    };
    const onTouchEnd = (e: React.TouchEvent) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) {
            goTo(index + (dx < 0 ? 1 : -1));
        }
        touchX.current = null;
    };

    return (
        <div>
            <div
                className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#F4EEE2] border border-[#181410]/10 shadow-[0_24px_50px_-24px_rgba(24,20,16,0.3)] select-none"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                {imgs.map((src, i) => (
                    <img
                        key={i}
                        src={src}
                        alt={i === 0 ? name : `${name} — ছবি ${i + 1}`}
                        draggable={false}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                            i === index ? "opacity-100" : "opacity-0"
                        } ${outOfStock ? "grayscale opacity-60" : ""}`}
                    />
                ))}

                {outOfStock ? (
                    <div className="absolute top-4 left-4 bg-[#181410] text-[#FFFDF7] font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.14em] px-3 py-1.5 rounded-full">
                        স্টক নেই
                    </div>
                ) : (
                    <div className="absolute top-4 left-4 bg-[#FFFDF7]/95 backdrop-blur text-[#0E3B2C] font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.14em] px-3 py-1.5 rounded-full border border-[#C6A15B]/50">
                        Premium pick
                    </div>
                )}

                {/* Prev/Next arrows */}
                {imgs.length > 1 && !outOfStock && (
                    <>
                        <button
                            type="button"
                            onClick={() => goTo(index - 1)}
                            aria-label="আগের ছবি"
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#FFFDF7]/90 backdrop-blur flex items-center justify-center text-[#181410] text-lg shadow-md hover:bg-[#FFFDF7] transition-colors"
                        >
                            ‹
                        </button>
                        <button
                            type="button"
                            onClick={() => goTo(index + 1)}
                            aria-label="পরের ছবি"
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#FFFDF7]/90 backdrop-blur flex items-center justify-center text-[#181410] text-lg shadow-md hover:bg-[#FFFDF7] transition-colors"
                        >
                            ›
                        </button>
                        <div className="absolute bottom-3 left-3 bg-[#181410]/70 backdrop-blur text-[#FFFDF7] font-['IBM_Plex_Mono'] text-[11px] px-2.5 py-1 rounded-full">
                            {index + 1} / {imgs.length}
                        </div>
                    </>
                )}
            </div>

            {/* Thumbnail — click e display bodlabe */}
            {imgs.length > 1 && (
                <div className="flex gap-3 mt-4">
                    {imgs.map((img, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => goTo(i)}
                            aria-label={`ছবি ${i + 1} দেখুন`}
                            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#F4EEE2] border-2 transition-all ${
                                i === index
                                    ? "border-[#C6A15B] shadow-md"
                                    : "border-transparent opacity-70 hover:opacity-100 hover:border-[#C6A15B]/60"
                            }`}
                        >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}