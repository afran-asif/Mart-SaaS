import CartIcon from "./CartIcon";
import Link from "next/link";

interface StorefrontHeaderProps {
    variant: "home" | "sub";
    storeName?: string;
    storeLogo?: string;
    brandColor?: string;
    theme?: string;
}

const themeHeader: Record<string, string> = {
    classic: "bg-[#FFFDF7]/90 border-[#C6A15B]/40",
    minimal: "bg-white/90 border-gray-200",
    bold: "bg-[#0a0a0a]/90 border-white/10",
    elegant: "bg-[#fdfbf7]/90 border-[#e8e0d0]",
    vibrant: "bg-white/90 border-orange-100",
    retro: "bg-[#fff8dc]/90 border-[#d2b48c]",
    luxe: "bg-[#0a0a0a]/90 border-[#d4af37]/20",
    pastel: "bg-[#fdf2f8]/90 border-pink-100",
    urban: "bg-[#f3f4f6]/90 border-gray-300",
};

const themeText: Record<string, string> = {
    classic: "text-[#181410]",
    minimal: "text-gray-900",
    bold: "text-white",
    elegant: "text-[#3a332a]",
    vibrant: "text-gray-900",
    retro: "text-[#5d4037]",
    luxe: "text-[#d4af37]",
    pastel: "text-gray-700",
    urban: "text-gray-900",
};

const themeSubText: Record<string, string> = {
    classic: "text-[#75705F]",
    minimal: "text-gray-500",
    bold: "text-white/60",
    elegant: "text-[#8a7d6b]",
    vibrant: "text-gray-500",
    retro: "text-[#8b7355]",
    luxe: "text-[#d4af37]/60",
    pastel: "text-pink-400",
    urban: "text-gray-500",
};

export default function StorefrontHeader({ variant, storeName, storeLogo, brandColor, theme = "classic" }: StorefrontHeaderProps) {
    const headerBg = themeHeader[theme] || themeHeader.classic;
    const titleColor = themeText[theme] || themeText.classic;
    const subColor = themeSubText[theme] || themeSubText.classic;
    return (
        <header className={`sticky top-0 z-30 backdrop-blur-md border-b ${headerBg}`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                {variant === "home" ? (
                    <div className="flex items-center gap-3 sm:gap-4">
                        {storeLogo ? (
                            <img
                                src={storeLogo}
                                alt={storeName}
                                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-[#0E3B2C] ring-offset-2 ring-offset-[#FFFDF7]"
                            />
                        ) : (
                            <div
                                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-[#FFFDF7] font-['Fraunces',serif] font-semibold text-xl"
                                style={{ background: brandColor || "#0E3B2C" }}
                            >
                                {storeName?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h1 className={`font-['Fraunces',serif] font-semibold text-xl sm:text-2xl leading-tight tracking-tight ${titleColor}`}>
                                {storeName}
                            </h1>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="relative flex w-1.5 h-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1F9D55] opacity-60" />
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#1F9D55]" />
                                </span>
                                <span className={`font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.14em] ${subColor}`}>
                                    Open now
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Link
                        href="/"
                        className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors underline-offset-4 hover:underline ${titleColor} hover:opacity-70`}
                    >
                        ← দোকানে ফিরে যান
                    </Link>
                )}

                <CartIcon theme={theme} />
            </div>
        </header>
    );
}