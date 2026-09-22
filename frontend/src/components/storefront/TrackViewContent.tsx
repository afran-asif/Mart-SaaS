"use client";

import { useEffect } from "react";
import { trackViewContent, TrackProduct } from "@/lib/tracking";

export default function TrackViewContent({ product }: { product: TrackProduct }) {
    useEffect(() => {
        if (product && product.id) {
            trackViewContent(product);
        }
    }, [product.id, product.name, product.price]);

    return null;
}
