import type { Metadata } from "next";
import { getStoreName } from "@/lib/getStoreName";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
    const { subdomain } = await params;
    const storeName = await getStoreName(subdomain);

    return {
        title: storeName ? `${storeName} - Cart` : "Cart",
    };
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}