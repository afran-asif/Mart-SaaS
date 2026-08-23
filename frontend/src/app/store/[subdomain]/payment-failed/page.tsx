// app/store/[subdomain]/payment-failed/page.tsx
import StorefrontHeader from "@/components/storefront/StorefrontHeader";

// app/store/[subdomain]/payment-failed/page.tsx
export default async function PaymentFailedPage({
    searchParams,
}: {
    searchParams: Promise<{ reason?: string }>;
}) {
    const { reason } = await searchParams;
    const isCancelled = reason === "cancelled";

    return (
        <div className="min-h-screen bg-[#F6F3EC]">
            <StorefrontHeader variant="sub" />

            <main className="max-w-2xl mx-auto px-6 py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mx-auto mb-6">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F6F3EC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </div>

                <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-[#1B1E19] mb-2">
                    {isCancelled ? "পেমেন্ট বাতিল করা হয়েছে" : "পেমেন্ট সম্পন্ন হয়নি"}
                </h1>
                <p className="text-[#8B8F82] text-sm mb-8">
                    {isCancelled
                        ? "আপনি পেমেন্ট প্রক্রিয়াটি বাতিল করেছেন। চাইলে আবার চেষ্টা করতে পারেন।"
                        : "দুঃখিত, আপনার পেমেন্টটি সম্পন্ন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন, অথবা অন্য কোনো পেমেন্ট মাধ্যম বেছে নিন।"}
                </p>

                <div className="flex items-center justify-center gap-3">
                    <a
                        href="/cart"
                        className="inline-block bg-[#274B3B] text-[#F6F3EC] px-6 py-3 rounded-lg text-sm font-medium hover:bg-[#1F3D2F] transition-colors"
                    >
                        আবার চেষ্টা করুন
                    </a>
                    <a
                        href="/"
                        className="inline-block bg-white border border-[#1B1E19]/15 text-[#1B1E19] px-6 py-3 rounded-lg text-sm font-medium hover:bg-[#F6F3EC] transition-colors"
                    >
                        দোকানে ফিরে যান
                    </a>
                </div>
            </main>
        </div>
    );
}