"use client";

import { useState, useEffect, useCallback } from "react";
import { getMySubscription, SubscriptionInfo } from "@/services/subscriptionService";

export function useSubscription() {
    const [sub, setSub] = useState<SubscriptionInfo | null>(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const data = await getMySubscription();
            setSub(data);
        } catch {
            setSub(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { sub, loading, refresh, isPro: sub?.plan === "pro" };
}