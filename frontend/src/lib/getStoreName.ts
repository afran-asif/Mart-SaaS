interface Store {
    storeName: string;
}

export async function getStoreName(subdomain: string): Promise<string | null> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

    try {
        const res = await fetch(`${baseUrl}/tenant/store`, {
            headers: { "X-Tenant-Subdomain": subdomain },
            cache: "no-store",
        });

        if (!res.ok) {
            return null;
        }

        const data = await res.json();
        return (data.store as Store)?.storeName || null;
    } catch {
        return null;
    }
}