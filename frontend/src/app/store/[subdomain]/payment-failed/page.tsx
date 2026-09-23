// app/store/[subdomain]/payment-failed/page.tsx
import type { Metadata } from "next";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";
import { getStoreName } from "@/lib/store";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
    const { subdomain } = await params;
    const storeName = await getStoreName(subdomain);

    return {
        title: storeName ? `${storeName} - Payment Failed` : "Payment Failed",
    };
}

export default async function PaymentFailedPage({
    searchParams,
}: {
    searchParams: Promise<{ reason?: string }>;
}) {
    const { reason } = await searchParams;
    const isCancelled = reason === "cancelled";

    return (
        <div className="min-h-screen bg-[#FFFDF7]">
            <StorefrontHeader variant="sub" />

            <main className="max-w-2xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
                <div className="bg-white rounded-3xl border border-[#181410]/10 px-6 py-10 sm:px-12 text-center shadow-[0_24px_60px_-24px_rgba(24,20,16,0.3)]">
                    <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-600/25">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFDF7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </div>

                    <h1 className="font-['Fraunces',serif] text-3xl sm:text-4xl font-semibold text-[#181410] mb-2 tracking-tight">
                        {isCancelled ? "পেমেন্ট বাতিল করা হয়েছে" : "পেমেন্ট সম্পন্ন হয়নি"}
                    </h1>
                    <p className="text-[#75705F] text-sm mb-8">
                        {isCancelled
                            ? "আপনি পেমেন্ট প্রক্রিয়াটি বাতিল করেছেন। চাইলে আবার চেষ্টা করতে পারেন।"
                            : "দুঃখিত, আপনার পেমেন্টটি সম্পন্ন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন, অথবা অন্য কোনো পেমেন্ট মাধ্যম বেছে নিন।"}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <a
                            href="/cart"
                            className="inline-block bg-[#F4501A] text-white px-7 py-3 rounded-xl text-sm font-medium hover:bg-[#D63F0F] transition-all shadow-lg shadow-[#F4501A]/25"
                        >
                            আবার চেষ্টা করুন
                        </a>
                        <a
                            href="/"
                            className="inline-block bg-white border-2 border-[#0E3B2C] text-[#0E3B2C] px-7 py-3 rounded-xl text-sm font-medium hover:bg-[#0E3B2C] hover:text-white transition-all"
                        >
                            দোকানে ফিরে যান
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}