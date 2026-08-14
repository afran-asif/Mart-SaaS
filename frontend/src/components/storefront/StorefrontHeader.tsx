import CartIcon from "./CartIcon";

interface StorefrontHeaderProps {
    variant: "home" | "sub";
    storeName?: string;
    storeLogo?: string;
}

export default function StorefrontHeader({ variant, storeName, storeLogo }: StorefrontHeaderProps) {
    return (
        <header className="sticky top-0 z-10 bg-[#F6F3EC]/95 backdrop-blur-sm border-b border-[#1B1E19]/10">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                {variant === "home" ? (
                    <div className="flex items-center gap-4">
                        {storeLogo ? (
                            <img
                                src={storeLogo}
                                alt={storeName}
                                className="w-11 h-11 rounded-full object-cover border-2 border-[#274B3B]"
                            />
                        ) : (
                            <div className="w-11 h-11 rounded-full bg-[#274B3B] flex items-center justify-center text-[#F6F3EC] font-['Space_Grotesk'] font-bold text-lg">
                                {storeName?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h1 className="font-['Space_Grotesk'] font-bold text-xl text-[#1B1E19] leading-tight">
                                {storeName}
                            </h1>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#E7A23D]" />
                                <span className="font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-wider text-[#8B8F82]">
                                    Open now
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <a
                        href="/"
                        className="inline-flex items-center gap-1.5 text-sm text-[#274B3B] font-medium hover:underline underline-offset-4"
                    >
                        ← দোকানে ফিরে যান
                    </a>
                )}

                <CartIcon />
            </div>
        </header>
    );
}