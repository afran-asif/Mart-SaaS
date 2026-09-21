import type { Metadata } from "next";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;

    return {
        title: locale === "bn" ? "লগইন - Vendoo" : "Log in - Vendoo",
    };
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}