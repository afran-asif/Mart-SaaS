"use client";
import { useState, useEffect, useCallback } from "react";
import { getCategories, type Category } from "@/services/categoryService";

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch {
            // silent — ফিল্টার/ড্রপডাউন শুধু খালি থাকবে
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { categories, loading, refresh };
}