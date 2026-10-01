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
    categories?: string[];
}

export default function StorefrontFooter({
    storeName = "",
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
    categories = [],
}: StorefrontFooterProps) {
    const isDark = isDarkTheme(theme);
    const isLuxe = isLuxeTheme(theme);
    const brand = brandColor || "#F4501A";

    // খালি থাকলে row দেখাবে না (fake default তথ্য নয়)
    const displayPhone = phone || whatsappNumber || "";
    const displayEmail = email || "";
    const displayAddress = address || "";
    const hasContact = !!(displayPhone || displayEmail || displayAddress);
    const hasSocial = !!(facebookUrl || instagramUrl || whatsappNumber);

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
                {/* Main Columns Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-8">
                    {/* Column 1: Brand Logo, Tagline, Socials */}
                    <div className="flex flex-col items-start space-y-4">
                        <Link href="/" className="inline-block transition-transform hover:scale-105">
                            {storeLogo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={storeLogo}
                                    alt={storeName}
                                    className="h-10 sm:h-12 w-auto max-w-[160px] object-contain rounded-md"
                                />
                            ) : (
                                <div className="flex items-center gap-2">
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
                                    {storeName ? (
                                        <span
                                            className={`font-['Fraunces',serif] text-xl font-bold tracking-tight ${
                                                isLuxe ? "text-[#d4af37]" : isDark ? "text-white" : "text-gray-900"
                                            }`}
                                        >
                                            {storeName}
                                        </span>
                                    ) : null}
                                </div>
                            )}
                        </Link>

                        {tagline ? (
                            <p
                                className={`text-sm leading-relaxed max-w-xs ${
                                    isDark ? "text-gray-400" : "text-gray-600"
                                }`}
                            >
                                {tagline}
                            </p>
                        ) : null}

                        {/* Social Icons (Facebook, Instagram) */}
                        {hasSocial && (
                            <div className="flex items-center gap-2.5 pt-1">
                                {facebookUrl && (
                                    <a
                                        href={facebookUrl}
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
                                )}

                                {instagramUrl && (
                                    <a
                                        href={instagramUrl}
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
                                )}

                                {whatsappNumber && (
                                    <a
                                        href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="WhatsApp"
                                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 border ${
                                            isDark
                                                ? "border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-orange-500 hover:bg-orange-500/10"
                                                : "border-gray-200 bg-white text-gray-500 hover:text-[#25D366] hover:border-[#25D366]/40 hover:bg-[#25D366]/5 hover:shadow-xs"
                                        }`}
                                    >
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                            <path d="M17.5 14.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.11 3.22 5.1 4.51.71.31 1.27.49 1.71.63.72.23 1.37.2 1.88.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35M12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 1 1 8.38 4.63M12.05 0A11.82 11.82 0 0 0 .25 11.85c0 2.08.55 4.12 1.59 5.92L.25 24l6.4-1.68a11.8 11.8 0 0 0 5.4 1.38h.01A11.82 11.82 0 0 0 12.05 0" />
                                        </svg>
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Column 2: Quick Links (সব real link) */}
                    <div>
                        <h4
                            className={`font-semibold text-sm sm:text-base mb-4 tracking-tight ${
                                isLuxe ? "text-[#d4af37]" : isDark ? "text-white" : "text-gray-900"
                            }`}
                        >
                            Quick Links
                        </h4>
                        <ul className="space-y-2.5 text-sm">
                            {[
                                { label: "Home", href: "/" },
                                { label: "Products", href: "/#collection" },
                                { label: "Track Order", href: "/track" },
                                { label: "My Cart", href: "/cart" },
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

                    {/* Column 3: Categories (dynamic — না থাকলে column hidden) */}
                    {categories.length > 0 && (
                        <div>
                            <h4
                                className={`font-semibold text-sm sm:text-base mb-4 tracking-tight ${
                                    isLuxe ? "text-[#d4af37]" : isDark ? "text-white" : "text-gray-900"
                                }`}
                            >
                                Categories
                            </h4>
                            <ul className="space-y-2.5 text-sm">
                                {categories.slice(0, 6).map((name) => (
                                    <li key={name}>
                                        <Link
                                            href={`/category/${encodeURIComponent(name)}`}
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
                                            <span className="hover:underline underline-offset-4 truncate max-w-[160px]">{name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Column 4: Contact Info (data থাকলেই row) */}
                    {hasContact && (
                        <div>
                            <h4
                                className={`font-semibold text-sm sm:text-base mb-4 tracking-tight ${
                                    isLuxe ? "text-[#d4af37]" : isDark ? "text-white" : "text-gray-900"
                                }`}
                            >
                                Contact Info
                            </h4>
                            <ul className="space-y-3.5 text-sm">
                                {displayAddress ? (
                                    <li className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                                            style={{
                                                backgroundColor: `${brand}15`,
                                                borderColor: `${brand}30`,
                                                color: brand,
                                            }}
                                        >
                                            <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                                                <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z" />
                                                <circle cx="12" cy="9" r="2.5" />
                                            </svg>
                                        </div>
                                        <span className={isDark ? "text-gray-400" : "text-gray-600"}>{displayAddress}</span>
                                    </li>
                                ) : null}

                                {displayPhone ? (
                                    <li className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                                            style={{
                                                backgroundColor: `${brand}15`,
                                                borderColor: `${brand}30`,
                                                color: brand,
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
                                ) : null}

                                {displayEmail ? (
                                    <li className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                                            style={{
                                                backgroundColor: `${brand}15`,
                                                borderColor: `${brand}30`,
                                                color: brand,
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
                                ) : null}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Bottom Row */}
                <div
                    className={`mt-12 pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-xs ${
                        isDark ? "border-white/10 text-gray-400" : "border-gray-200 text-gray-500"
                    }`}
                >
                    {/* Left: Copyright */}
                    <p className="text-center font-normal order-2 md:order-1">
                        © {new Date().getFullYear()} {storeName || "Store"}. All rights reserved.
                    </p>

                    {/* Right: A product of Vendoo (Pro-তে hidden) */}
                    {plan !== "pro" && (
                        <div className="flex items-center gap-2 order-1 md:order-2">
                            <span>A product of</span>
                            <a
                                href={process.env.NEXT_PUBLIC_SITE_URL || "https://vendoo.shop"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 font-bold tracking-tight hover:opacity-80 transition-opacity"
                                style={{ color: brand }}
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M4 4L12 20L20 4L14 14L12 10L10 14L4 4Z"
                                        fill={brand}
                                    />
                                </svg>
                                <span className={isDark ? "text-white" : "text-gray-900"}>Vendoo</span>
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </footer>
    );
}
