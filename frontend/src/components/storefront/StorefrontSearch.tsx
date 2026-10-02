"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const themeSearchBg: Record<string, string> = {
    classic: "bg-white border-[#C6A15B]/50",
    minimal: "bg-white border-gray-300",
    bold: "bg-white/10 border-white/20",
    elegant: "bg-white border-[#e8e0d0]",
    vibrant: "bg-white border-orange-200",
    retro: "bg-white border-[#d2b48c]",
    luxe: "bg-white/10 border-[#d4af37]/30",
    pastel: "bg-white border-pink-200",
    urban: "bg-white border-gray-300",
};

const themeSearchText: Record<string, string> = {
    classic: "text-[#181410] placeholder-[#75705F]/70",
    minimal: "text-gray-900 placeholder-gray-400",
    bold: "text-white placeholder-white/50",
    elegant: "text-[#3a332a] placeholder-[#8a7d6b]/70",
    vibrant: "text-gray-900 placeholder-gray-400",
    retro: "text-[#5d4037] placeholder-[#8b7355]/70",
    luxe: "text-white placeholder-[#d4af37]/50",
    pastel: "text-gray-700 placeholder-pink-300",
    urban: "text-gray-900 placeholder-gray-400",
};

export default function StorefrontSearch({ theme = "classic" }: { theme?: string }) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [q, setQ] = useState("");

    useEffect(() => {
        const v = new URLSearchParams(window.location.search).get("q");
        if (v) setQ(v);
    }, []);

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const term = q.trim();
        if (!term) return;
        router.push(`/products?q=${encodeURIComponent(term)}`);
    };

    const box = themeSearchBg[theme] || themeSearchBg.classic;
    const txt = themeSearchText[theme] || themeSearchText.classic;
    const dark = theme === "bold" || theme === "luxe";

    return (
        <form
            onSubmit={submit}
            role="search"
            className={`relative flex items-center w-full rounded-full border shadow-sm transition-colors focus-within:ring-2 focus-within:ring-[#F4501A]/40 ${box}`}
        >
            <span className={`pl-3.5 shrink-0 ${dark ? "text-white/60" : "text-[#75705F]"}`} aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.3-4.3" />
                </svg>
            </span>
            <input
                ref={inputRef}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products…"
                aria-label="Search products"
                className={`w-full bg-transparent outline-none text-sm py-2 pr-4 pl-2 min-w-0 ${txt}`}
            />
            {q && (
                <button
                    type="button"
                    onClick={() => {
                        setQ("");
                        inputRef.current?.focus();
                    }}
                    aria-label="Clear search"
                    className={`mr-2 shrink-0 text-xs ${dark ? "text-white/50 hover:text-white" : "text-[#75705F] hover:text-[#181410]"}`}
                >
                    ✕
                </button>
            )}
        </form>
    );
}