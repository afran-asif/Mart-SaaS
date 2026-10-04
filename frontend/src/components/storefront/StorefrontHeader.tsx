import CartIcon from "./CartIcon";
import StorefrontSearch from "./StorefrontSearch";
import Link from "next/link";

interface StorefrontHeaderProps {
    variant: "home" | "sub";
    storeName?: string;
    storeLogo?: string;
    brandColor?: string;
    theme?: string;
    hideTrack?: boolean;
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

export default function StorefrontHeader({ variant, storeName, storeLogo, brandColor, theme = "classic", hideTrack = false }: StorefrontHeaderProps) {
    const headerBg = themeHeader[theme] || themeHeader.classic;
    const titleColor = themeText[theme] || themeText.classic;
    const subColor = themeSubText[theme] || themeSubText.classic;
    return (
        <header className={`sticky top-0 z-30 backdrop-blur-md border-b shadow-[0_6px_18px_-10px_rgba(24,20,16,0.2)] ${headerBg}`}>
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center justify-between gap-2 sm:gap-4">
                    {variant === "home" ? (
                        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                            {storeLogo ? (
                                <img
                                    src={storeLogo}
                                    alt={storeName}
                                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-cover ring-1 ring-gray-200 shadow-sm"
                                />
                            ) : (
                                <div
                                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center text-[#FFFDF7] font-['Fraunces',serif] font-semibold text-lg ring-1 ring-gray-200 shadow-sm"
                                    style={{ background: brandColor || "#0E3B2C" }}
                                >
                                    {storeName?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="pb-1">
                                <h1 className={`font-['Fraunces',serif] font-semibold text-lg sm:text-xl leading-tight tracking-tight mt-0.5 ${titleColor}`}>
                                    {storeName}
                                </h1>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="relative flex w-1.5 h-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1F9D55] opacity-60" />
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#1F9D55]" />
                                    </span>
                                    <span className={`text-xs ${subColor}`}>
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Link
                            href="/"
                            className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors underline-offset-4 hover:underline shrink-0 ${titleColor} hover:opacity-70`}
                        >
                            ← দোকানে ফিরে যান
                        </Link>
                    )}

                    {/* PC-তে মাঝে সার্চ বার */}
                    <div className="hidden md:block flex-1 max-w-md mx-auto">
                        <StorefrontSearch theme={theme} />
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {!hideTrack && (
                            <Link
                                href="/track"
                                className={`text-xs sm:text-sm font-medium transition-all underline-offset-4 hover:underline active:opacity-50 active:scale-95 touch-manipulation ${titleColor} hover:opacity-70`}
                            >
                                🚚 Track Order
                            </Link>
                        )}
                        <CartIcon theme={theme} />
                    </div>
                </div>

                {/* Mobile-তে সার্চ বার — পুরো width */}
                <div className="md:hidden mt-3">
                    <StorefrontSearch theme={theme} />
                </div>
            </div>
        </header>
    );
}