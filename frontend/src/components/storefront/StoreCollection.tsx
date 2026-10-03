"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { api } from "@/services/api";
import StoreGrid from "./StoreGrid";
import StoreList from "./StoreList";

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
    /** দিলে infinite-scroll-এর বদলে "More" link button (home-এর জন্য) */
    moreHref?: string;
    moreLabel?: string;
    /** 🔎 search term — load-more fetch-এও পাঠানো হয় */
    search?: string | null;
    /** true দিলে sort dropdown + grid/list toggle দেখাবে (products/category page) */
    controls?: boolean;
}

const PAGE_SIZE = 24;

type SortKey = "newest" | "price-asc" | "price-desc";
type ViewMode = "grid" | "list";

export default function StoreCollection({
    initialProducts,
    total,
    categories,
    theme,
    brand,
    title,
    activeCategory = null,
    category = null,
    moreHref,
    moreLabel,
    search = null,
    controls = false,
}: StoreCollectionProps) {
    // page-wise batches — নতুন batch আলাদা wrapper-এ, entry animation-সহ
    const [pages, setPages] = useState<Product[][]>([initialProducts]);
    const [loadingMore, setLoadingMore] = useState(false);
    const [sort, setSort] = useState<SortKey>("newest");
    const [view, setView] = useState<ViewMode>(() => {
        if (typeof window === "undefined") return "grid";
        return (localStorage.getItem("vendoo-view") as ViewMode) === "list" ? "list" : "grid";
    });
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
            if (search) params.search = search;
            if (sort !== "newest") params.sort = sort;
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
    }, [category, search, sort]);

    // Sort বদলালে page-1 থেকে fresh fetch
    const handleSortChange = useCallback(
        async (next: SortKey) => {
            if (next === sort || loadingRef.current) return;
            setSort(next);
            loadingRef.current = true;
            setLoadingMore(true);
            try {
                const params: Record<string, string | number> = { page: 1, limit: PAGE_SIZE };
                if (category) params.category = category;
                if (search) params.search = search;
                if (next !== "newest") params.sort = next;
                const res = await api.get("/tenant/products", { params });
                setPages([res.data.products || []]);
                pageRef.current = 1;
            } catch {
                /* silent */
            } finally {
                loadingRef.current = false;
                setLoadingMore(false);
            }
        },
        [sort, category, search]
    );

    const handleViewChange = useCallback((next: ViewMode) => {
        setView(next);
        try {
            localStorage.setItem("vendoo-view", next);
        } catch { /* ignore */ }
    }, []);

    // Infinite scroll — sentinel viewport-এ এলে auto-load (moreHref থাকলে link mode)
    useEffect(() => {
        if (moreHref) return;
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
    }, [loadMore, hasMore, loadedCount, moreHref]);

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
                            href="/products"
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

                {/* Sort + view controls */}
                {controls && (
                    <div className="flex items-center gap-2 sm:gap-3 mt-5">
                        <label htmlFor="sort-select" className={`font-['IBM_Plex_Mono'] text-[11px] tracking-[0.15em] uppercase shrink-0 ${isLuxe ? "text-[#d4af37]/70" : isDark ? "text-white/60" : "text-[#75705F]"}`}>
                            সাজান
                        </label>
                        <div className="relative">
                            <select
                                id="sort-select"
                                value={sort}
                                onChange={(e) => handleSortChange(e.target.value as SortKey)}
                                className={`appearance-none text-xs sm:text-sm font-semibold rounded-full pl-4 pr-9 py-2 cursor-pointer border transition-colors outline-none ${
                                    isDark
                                        ? "bg-white/10 text-white border-white/15 hover:border-white/30"
                                        : "bg-white text-[#181410] border-[#181410]/15 hover:border-[#181410]/30 shadow-sm"
                                }`}
                            >
                                <option value="newest">নতুন আগে</option>
                                <option value="price-asc">দাম: কম → বেশি</option>
                                <option value="price-desc">দাম: বেশি → কম</option>
                            </select>
                            <svg className={`w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/60" : "text-[#181410]/50"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        <div className={`flex items-center rounded-full border p-0.5 ml-auto ${isDark ? "border-white/15 bg-white/5" : "border-[#181410]/15 bg-white shadow-sm"}`} role="group" aria-label="View mode">
                            <button
                                type="button"
                                onClick={() => handleViewChange("grid")}
                                aria-label="Grid view"
                                aria-pressed={view === "grid"}
                                className={`p-2 rounded-full transition-all active:scale-90 ${view === "grid" ? "text-white shadow" : isDark ? "text-white/50 hover:text-white" : "text-[#181410]/40 hover:text-[#181410]"}`}
                                style={view === "grid" ? { background: brand } : undefined}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleViewChange("list")}
                                aria-label="List view"
                                aria-pressed={view === "list"}
                                className={`p-2 rounded-full transition-all active:scale-90 ${view === "list" ? "text-white shadow" : isDark ? "text-white/50 hover:text-white" : "text-[#181410]/40 hover:text-[#181410]"}`}
                                style={view === "list" ? { background: brand } : undefined}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {loadedCount === 0 ? (
                search || activeCategory ? (
                    <div className="py-20 text-center">
                        <p className={`font-['Fraunces',serif] text-2xl font-semibold mb-2 ${isLuxe ? "text-[#d4af37]" : isDark ? "text-white" : "text-[#181410]"}`}>
                            {search ? `"${search}" এর সাথে কোনো প্রোডাক্ট পাওয়া যায়নি` : "এই ক্যাটাগরিতে কিছু নেই"}
                        </p>
                        <Link
                            href="/products"
                            className="text-sm font-semibold hover:underline underline-offset-4"
                            style={{ color: brand }}
                        >
                            {search ? "সব প্রোডাক্ট দেখুন →" : "সব প্রোডাক্ট দেখুন →"}
                        </Link>
                    </div>
                ) : (
                    <StoreGrid products={[]} theme={theme} brand={brand} />
                )
            ) : (
                <>
                    {pages.map((batch, i) => (
                        <div key={`${sort}-${i}`} className={i === 0 ? undefined : "animate-reveal mt-4 sm:mt-7"}>
                            {view === "list" ? (
                                <StoreList products={batch} theme={theme} brand={brand} />
                            ) : (
                                <StoreGrid products={batch} theme={theme} brand={brand} />
                            )}
                        </div>
                    ))}

                    {/* Sentinel — নিচে গেলেই auto-load + shimmer */}
                    {hasMore && !moreHref && (
                        <div ref={sentinelRef} className="mt-4 sm:mt-7">
                            {loadingMore ? (
                                view === "list" ? (
                                    <div className="flex flex-col gap-3">
                                        {[0, 1, 2].map((s) => (
                                            <div key={s} className="flex items-center gap-4 rounded-2xl border border-[#181410]/10 p-3">
                                                <div className="w-16 h-20 rounded-xl bg-gray-200 animate-pulse shrink-0" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 rounded bg-gray-200 animate-pulse w-2/3" />
                                                    <div className="h-4 rounded bg-gray-200 animate-pulse w-1/4" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
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
                            )
                            ) : (
                                <div className="h-4" />
                            )}
                        </div>
                    )}

                    {/* More-link mode (home) */}
                    {moreHref && (
                        <div className="flex justify-center mt-8 sm:mt-10">
                            <Link
                                href={moreHref}
                                className="px-8 py-3 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 touch-manipulation"
                                style={{ background: brand, color: "#fff" }}
                            >
                                {moreLabel || "More products →"}
                            </Link>
                        </div>
                    )}
                </>
            )}
        </>
    );
}
