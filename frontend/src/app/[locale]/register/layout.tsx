import type { Metadata } from "next";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;

    return {
        title: locale === "bn" ? "রেজিস্টার - Vendoo" : "Register - Vendoo",
    };
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}