import { getStoreInfo } from "@/lib/store";
import TrackingScripts from "@/components/storefront/TrackingScripts";

export default async function StoreLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ subdomain: string }>;
}) {
    const { subdomain } = await params;
    const store = await getStoreInfo(subdomain);

    return (
        <>
            {store && (
                <TrackingScripts
                    facebookPixelId={store.facebookPixelId || undefined}
                    googleAnalyticsId={store.googleAnalyticsId || undefined}
                    tiktokPixelId={store.tiktokPixelId || undefined}
                />
            )}
            {children}
        </>
    );
}