"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function CartIcon({ theme = "classic" }: { theme?: string }) {
    const totalQuantity = useSelector((state: RootState) => state.cart.totalQuantity);
    const isDark = theme === "bold" || theme === "luxe";
    const isLuxe = theme === "luxe";
    const stroke = isLuxe ? "#d4af37" : isDark ? "#ffffff" : "#181410";
    const hoverBg = isDark ? "hover:bg-white/10" : "hover:bg-[#F4EEE2]";

    return (
        <Link
            href="/cart"
            className={`relative inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors ${hoverBg}`}
            aria-label="কার্ট দেখুন"
        >
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={stroke}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>

            {totalQuantity > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#F4501A] text-white text-[10px] font-['IBM_Plex_Mono'] font-medium w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center shadow-sm">
                    {totalQuantity}
                </span>
            )}
        </Link>
    );
}