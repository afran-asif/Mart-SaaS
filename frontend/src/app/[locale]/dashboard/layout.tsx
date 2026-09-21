import type { Metadata } from "next";
import LocalizedDashboardShell from "./localized-dashboard-shell";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;

    return {
        title: locale === "bn" ? "ড্যাশবোর্ড - Vendoo" : "Dashboard - Vendoo",
    };
}

export default function LocalizedDashboardLayout({ children }: { children: React.ReactNode }) {
    return <LocalizedDashboardShell>{children}</LocalizedDashboardShell>;
}