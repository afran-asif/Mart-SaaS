"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { api } from "@/services/api";
import { useTranslation } from "@/hooks/useTranslation";

/** Locked (trial শেষ / unpaid) vendor → billing ছাড়া সব page-এ paywall */
export default function DashboardLockGate({
    children,
    billingHref,
}: {
    children: React.ReactNode;
    billingHref: string;
}) {
    const pathname = usePathname();
    const { user } = useSelector((state: any) => state.auth);
    const { t } = useTranslation();
    const [locked, setLocked] = useState<boolean | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            // super-admin / impersonated / unknown → gate প্রযোজ্য না (fail-open)
            if (!user || user.role !== "vendor") {
                if (!cancelled) setLocked(false);
                return;
            }
            try {
                const res = await api.get("/subscription/me");
                if (!cancelled) setLocked(!!res.data?.subscription?.locked);
            } catch {
                if (!cancelled) setLocked(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [user]);

    const onBillingPage = pathname.replace(/\/$/, "").endsWith("/dashboard/billing");

    if (locked && !onBillingPage) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl font-bold">
                        🔒
                    </div>
                    <h2 className="mt-4 text-xl font-bold text-gray-900">Trial শেষ হয়ে গেছে</h2>
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                        Pro চালিয়ে যেতে পেমেন্ট করুন — pay করলেই আপনার সব products, orders আর store আগের মতো ফিরে আসবে। কোনো data মুছবে না।
                    </p>
                    <Link
                        href={billingHref}
                        className="mt-6 inline-block px-8 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold transition-colors shadow-sm"
                    >
                        ⚡ এখনই Pro নিন
                    </Link>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
