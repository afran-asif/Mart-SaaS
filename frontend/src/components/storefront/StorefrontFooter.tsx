"use client";

import Link from "next/link";
import { isDarkTheme, isLuxeTheme } from "@/lib/storeTheme";

interface StorefrontFooterProps {
    storeName?: string;
    storeLogo?: string | null;
    brandColor?: string | null;
    tagline?: string | null;
    theme?: string;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    whatsappNumber?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    plan?: string;
}

export default function StorefrontFooter({
    storeName = "SESTONE",
    storeLogo,
    brandColor,
    tagline,
    theme = "classic",
    facebookUrl,
    instagramUrl,
    whatsappNumber,
    email,
    phone,
    address,
    plan,
}: StorefrontFooterProps) {
    const isDark = isDarkTheme(theme);
    const isLuxe = isLuxeTheme(theme);
    const brand = brandColor || "#F4501A";

    const displayPhone = phone || whatsappNumber || "01777059926";
    const displayEmail = email || "user@gmail.com";
    const displayAddress = address || "online";
    const displayTagline = tagline || "Buy your best cloth from here";

    // WhatsApp chat link — 017... → 88017... normalize
    const waDigits = (whatsappNumber || "").replace(/\D/g, "");
    const waNumber = waDigits
        ? waDigits.startsWith("880")
            ? waDigits
            : waDigits.startsWith("0")
            ? `880${waDigits.slice(1)}`
            : waDigits
        : null;

    return (
        <footer
            className={`w-full border-t transition-colors ${
                isLuxe
                    ? "bg-[#0a0a0a] border-[#d4af37]/20 text-gray-300"
                    : isDark
                    ? "bg-[#0d0d0d] border-white/10 text-gray-300"
                    : "bg-[#FAFAFA] border-gray-200/80 text-gray-700"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8">
                {/* Main 4 Columns Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 lg:gap-8">
                    {/* Column 1: Brand Logo, Tagline, Socials */}
                    <div className="flex flex-col items-start space-y-4">
                        <Link href="/" className="inline-block transition-transform hover:scale-105">
                            {storeLogo ? (
                                <img
                                    src={storeLogo}
                                    alt={storeName}
                                    className="h-10 sm:h-12 w-auto max-w-[160px] object-contain rounded-md"
                                />
                            ) : (
                                <div className="flex items-center gap-2">
                                    {/* Default orange stylized ribbon 'S' mark as shown in mockup */}
                                    <svg
                                        viewBox="0 0 48 48"
                                        className="w-10 h-10 shrink-0"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <rect width="48" height="48" rx="12" fill={brand} fillOpacity="0.08" />
                                        <path
                                            d="M14 20C14 15.5817 17.5817 12 22 12H30C32.2091 12 34 13.7909 34 16C34 18.2091 32.2091 20 30 20H18C15.7909 20 14 21.7909 14 24C14 26.2091 15.7909 28 18 28H30"
                                            stroke={brand}
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M34 28C34 32.4183 30.4183 36 26 36H18C15.7909 36 14 34.2091 14 32C14 29.7909 15.7909 28 18 28H30C32.2091 28 34 26.2091 34 24"
                                            stroke={brand}
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <span
                                        className={`font-['Fraunces',serif] text-xl font-bold tracking-tight ${
                                            isLuxe ? "text-[#d4af37]" : isDark ? "text-white" : "text-gray-900"
                                        }`}
                                    >
                                        {storeName}
                                    </span>
                                </div>
                            )}
                        </Link>

                        <p
                            className={`text-sm leading-relaxed max-w-xs ${
                                isDark ? "text-gray-400" : "text-gray-600"
                            }`}
                        >
                            {displayTagline}
                        </p>

                        {/* Social Icons (Facebook, Instagram, LinkedIn, YouTube) */}
                        <div className="flex items-center gap-2.5 pt-1">
                            {/* Facebook */}
                            <a
                                href={facebookUrl || "https://facebook.com"}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Facebook"
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 border ${
                                    isDark
                                        ? "border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-orange-500 hover:bg-orange-500/10"
                                        : "border-gray-200 bg-white text-gray-500 hover:text-[#1877F2] hover:border-[#1877F2]/40 hover:bg-[#1877F2]/5 hover:shadow-xs"
                                }`}
                            >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M14 13.5h2.5l1-4H14V7c0-1.1.9-2 2-2h1.5V1.5c-.3 0-1.5-.1-2.8-.1-2.9 0-4.7 1.8-4.7 4.9v3.2H7v4h3v9.5h4V13.5z" />
                                </svg>
                            </a>

                            {/* Instagram */}
                            <a
                                href={instagramUrl || "https://instagram.com"}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 border ${
                                    isDark
                                        ? "border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-orange-500 hover:bg-orange-500/10"
                                        : "border-gray-200 bg-white text-gray-500 hover:text-[#E4405F] hover:border-[#E4405F]/40 hover:bg-[#E4405F]/5 hover:shadow-xs"
                                }`}
                            >
                                <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                                    <rect x="2" y="2" width="20" height="20" rx="5" />
                                    <circle cx="12" cy="12" r="4" />
                                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                                </svg>
                            </a>

                            {/* LinkedIn */}
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="LinkedIn"
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 border ${
                                    isDark
                                        ? "border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-orange-500 hover:bg-orange-500/10"
                                        : "border-gray-200 bg-white text-gray-500 hover:text-[#0A66C2] hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/5 hover:shadow-xs"
                                }`}
                            >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                                </svg>
                            </a>

                            {/* YouTube */}
                            <a
                                href="https://youtube.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="YouTube"
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 border ${
                                    isDark
                                        ? "border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-orange-500 hover:bg-orange-500/10"
                                        : "border-gray-200 bg-white text-gray-500 hover:text-[#FF0000] hover:border-[#FF0000]/40 hover:bg-[#FF0000]/5 hover:shadow-xs"
                                }`}
                            >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.4-1.9.5-3.8.5-5.8 0-2-.1-3.9-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h4 className="font-semibold text-sm sm:text-base mb-4 tracking-tight text-[#d4af37]">
                            Quick Links
                            <span className="block w-8 h-0.5 rounded-full mt-1.5" style={{ background: "#F4501A" }} />
                        </h4>
                        <ul className="space-y-2.5 text-sm">
                            {[
                                { label: "Home", href: "/" },
                                { label: "All Products", href: "/products" },
                                { label: "My Cart", href: "/cart" },
                                { label: "Track Order", href: "/track" },
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link
                                        href={item.href}
                                        className={`group inline-flex items-center transition-colors ${
                                            isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
                                        }`}
                                    >
                                        <span
                                            style={{ color: brand }}
                                            className="font-bold mr-2 text-sm leading-none group-hover:translate-x-0.5 transition-transform"
                                        >
                                            ›
                                        </span>
                                        <span className="hover:underline underline-offset-4">{item.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: Contact Info */}
                    <div>
                        <h4 className="font-semibold text-sm sm:text-base mb-4 tracking-tight text-[#d4af37]">
                            Contact Info
                            <span className="block w-8 h-0.5 rounded-full mt-1.5" style={{ background: "#F4501A" }} />
                        </h4>
                        <ul className="space-y-3.5 text-sm">
                            {/* Address / Online */}
                            <li className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                                    style={{
                                        backgroundColor: "#F4501A15",
                                        borderColor: "#F4501A30",
                                        color: "#F4501A",
                                    }}
                                >
                                    <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z" />
                                        <circle cx="12" cy="9" r="2.5" />
                                    </svg>
                                </div>
                                <span className={isDark ? "text-gray-400" : "text-gray-600"}>{displayAddress}</span>
                            </li>

                            {/* Phone */}
                            <li className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                                    style={{
                                        backgroundColor: "#F4501A15",
                                        borderColor: "#F4501A30",
                                        color: "#F4501A",
                                    }}
                                >
                                    <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                </div>
                                <a
                                    href={`tel:${displayPhone.replace(/[^\d+]/g, "")}`}
                                    className={`hover:underline underline-offset-4 transition-colors ${
                                        isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
                                    }`}
                                >
                                    {displayPhone}
                                </a>
                            </li>

                            {/* Email */}
                            <li className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                                    style={{
                                        backgroundColor: "#F4501A15",
                                        borderColor: "#F4501A30",
                                        color: "#F4501A",
                                    }}
                                >
                                    <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </div>
                                <a
                                    href={`mailto:${displayEmail}`}
                                    className={`truncate hover:underline underline-offset-4 transition-colors ${
                                        isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
                                    }`}
                                >
                                    {displayEmail}
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Row */}
                <div
                    className={`mt-12 pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-xs ${
                        isDark ? "border-white/10 text-gray-400" : "border-gray-200 text-gray-500"
                    }`}
                >
                    {/* Left: Privacy Policy | Terms & Condition */}
                    <div className="flex items-center gap-2">
                        <Link href="/privacy" className="hover:underline underline-offset-4 hover:text-gray-800 transition-colors">
                            Privacy Policy
                        </Link>
                        <span className="text-gray-300">|</span>
                        <Link href="/terms" className="hover:underline underline-offset-4 hover:text-gray-800 transition-colors">
                            Terms & Condition
                        </Link>
                    </div>

                    {/* Center: Copyright */}
                    <p className="text-center font-normal">
                        © {new Date().getFullYear()} {storeName}. All rights reserved.
                    </p>

                    {/* Right: Powered by Vendoo */}
                    <div className="flex items-center gap-2">
                        <span>Powered by</span>
                        <a
                            href={process.env.NEXT_PUBLIC_SITE_URL || "https://vendoo.shop"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-bold tracking-tight hover:opacity-80 transition-opacity"
                            style={{ color: brand }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/favicon.ico" alt="Vendoo" className="w-4 h-4 rounded" />
                            <span className="text-[#d4af37]">Vendoo</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
