interface StoreLockedBannerProps {
    storeName?: string;
    theme?: string;
}

/** Locked store-এর storefront-এ slim notice — browse চলে, order বন্ধ */
export default function StoreLockedBanner({ storeName, theme = "classic" }: StoreLockedBannerProps) {
    const isDark = theme === "bold" || theme === "luxe";
    return (
        <div className={`text-center text-xs sm:text-sm font-medium px-4 py-2.5 ${isDark ? "bg-amber-400/10 text-amber-200 border-b border-amber-400/20" : "bg-amber-50 text-amber-800 border-b border-amber-200"}`}>
            ⏸️ {storeName || "This store"}-এ এখন অর্ডার নেওয়া হচ্ছে না — শীঘ্রই ফিরে আসছি।
        </div>
    );
}
