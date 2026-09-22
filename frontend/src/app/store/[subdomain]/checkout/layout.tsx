import type { Metadata } from "next";
import { getStoreName } from "@/lib/store";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
    const { subdomain } = await params;
    const storeName = await getStoreName(subdomain);

    return {
        title: storeName ? `${storeName} - Checkout` : "Checkout",
    };
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}