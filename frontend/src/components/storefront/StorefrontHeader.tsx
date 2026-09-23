import CartIcon from "./CartIcon";

interface StorefrontHeaderProps {
    variant: "home" | "sub";
    storeName?: string;
    storeLogo?: string;
}

export default function StorefrontHeader({ variant, storeName, storeLogo }: StorefrontHeaderProps) {
    return (
        <header className="sticky top-0 z-10 bg-[#FFFDF7]/90 backdrop-blur-md border-b border-[#C6A15B]/40">
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
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0E3B2C] flex items-center justify-center text-[#FFFDF7] font-['Fraunces',serif] font-semibold text-xl">
                                {storeName?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h1 className="font-['Fraunces',serif] font-semibold text-xl sm:text-2xl text-[#181410] leading-tight tracking-tight">
                                {storeName}
                            </h1>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="relative flex w-1.5 h-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1F9D55] opacity-60" />
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#1F9D55]" />
                                </span>
                                <span className="font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.14em] text-[#75705F]">
                                    Open now
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <a
                        href="/"
                        className="inline-flex items-center gap-1.5 text-sm text-[#0E3B2C] font-medium hover:text-[#F4501A] transition-colors underline-offset-4 hover:underline"
                    >
                        ← দোকানে ফিরে যান
                    </a>
                )}

                <CartIcon />
            </div>
        </header>
    );
}