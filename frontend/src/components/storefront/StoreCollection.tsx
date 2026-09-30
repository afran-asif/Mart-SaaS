"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { api } from "@/services/api";
import StoreGrid from "./StoreGrid";

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
    initialProducts: Product[];
    total: number;
    categories: Category[];
    theme: string;
    brand: string;
    title?: string;
    activeCategory?: string | null;
    /** load-more fetch-এ category filter (category page-এর জন্য) */
    category?: string | null;
}

const PAGE_SIZE = 24;

export default function StoreCollection({
    initialProducts,
    total,
    categories,
    theme,
    brand,
    title,
    activeCategory = null,
    category = null,
}: StoreCollectionProps) {
    // page-wise batches — নতুন batch আলাদা wrapper-এ, entry animation-সহ
    const [pages, setPages] = useState<Product[][]>([initialProducts]);
    const [loadingMore, setLoadingMore] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const isDark = theme === "bold" || theme === "luxe";
    const isLuxe = theme === "luxe";

    const loadedCount = pages.reduce((n, p) => n + p.length, 0);
    const hasMore = loadedCount < total;

    const pageRef = useRef(1);
    const loadingRef = useRef(false);

    const loadMore = useCallback(async () => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoadingMore(true);
        try {
            const nextPage = pageRef.current + 1;
            const params: Record<string, string | number> = { page: nextPage, limit: PAGE_SIZE };
            if (category) params.category = category;
            const res = await api.get("/tenant/products", { params });
            const next = res.data.products || [];
            if (next.length > 0) {
                setPages((prev) => [...prev, next]);
                pageRef.current = nextPage;
            }
        } catch {
            /* silent — scroll করলে আবার চেষ্টা হবে */
        } finally {
            loadingRef.current = false;
            setLoadingMore(false);
        }
    }, [category]);

    // Infinite scroll — sentinel viewport-এ এলে auto-load
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el || !hasMore) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            { rootMargin: "400px" }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [loadMore, hasMore, loadedCount]);

    return (
        <>
            <div className="mb-7 sm:mb-9">
                <p className={`font-['IBM_Plex_Mono'] text-[11px] tracking-[0.2em] uppercase mb-2 ${isLuxe ? "text-[#d4af37]/70" : isDark ? "text-white/60" : "text-[#C6A15B]"}`}>
                    Curated for you · {total} {total === 1 ? "item" : "items"}
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

            {loadedCount === 0 ? (
                activeCategory ? (
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
                    <StoreGrid products={[]} theme={theme} brand={brand} />
                )
            ) : (
                <>
                    {pages.map((batch, i) => (
                        <div key={i} className={i === 0 ? undefined : "animate-reveal mt-4 sm:mt-7"}>
                            <StoreGrid products={batch} theme={theme} brand={brand} />
                        </div>
                    ))}

                    {/* Sentinel — নিচে গেলেই auto-load + shimmer */}
                    {hasMore && (
                        <div ref={sentinelRef} className="mt-4 sm:mt-7">
                            {loadingMore ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-7">
                                    {[0, 1, 2, 3].map((s) => (
                                        <div key={s} className="rounded-2xl overflow-hidden border border-[#181410]/10">
                                            <div className="aspect-[4/5] bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
                                            <div className="p-3.5 sm:p-4 space-y-2">
                                                <div className="h-4 rounded bg-gray-200 animate-pulse w-3/4" />
                                                <div className="h-4 rounded bg-gray-200 animate-pulse w-1/3" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-4" />
                            )}
                        </div>
                    )}
                </>
            )}
        </>
    );
}
