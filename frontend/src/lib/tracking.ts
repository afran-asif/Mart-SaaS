// Standard E-commerce Tracking Helper for Meta Pixel, TikTok Pixel & Google Analytics

export interface TrackProduct {
    id: string;
    name: string;
    price: number;
}

export interface TrackCartItem extends TrackProduct {
    quantity: number;
}

export interface TrackPurchaseData {
    orderId: string;
    totalAmount: number;
    items?: TrackCartItem[];
}

/**
 * 1. ViewContent / view_item:
 * Fired when a customer views a product details page
 */
export function trackViewContent(product: TrackProduct) {
    if (typeof window === "undefined") return;
    const w = window as any;

    try {
        // Meta Pixel
        if (typeof w.fbq === "function") {
            w.fbq("track", "ViewContent", {
                content_name: product.name,
                content_ids: [product.id],
                content_type: "product",
                value: product.price,
                currency: "BDT",
            });
        }

        // TikTok Pixel
        if (typeof w.ttq === "function") {
            w.ttq.track("ViewContent", {
                content_id: product.id,
                content_name: product.name,
                content_type: "product",
                value: product.price,
                currency: "BDT",
            });
        }

        // Google Analytics
        if (typeof w.gtag === "function") {
            w.gtag("event", "view_item", {
                currency: "BDT",
                value: product.price,
                items: [
                    {
                        item_id: product.id,
                        item_name: product.name,
                        price: product.price,
                    },
                ],
            });
        }
    } catch (err) {
        console.warn("Tracking error in trackViewContent:", err);
    }
}

/**
 * 2. AddToCart / add_to_cart:
 * Fired when a customer adds a product to the cart
 */
export function trackAddToCart(product: TrackProduct, quantity: number = 1) {
    if (typeof window === "undefined") return;
    const w = window as any;

    try {
        const itemTotal = product.price * quantity;

        // Meta Pixel
        if (typeof w.fbq === "function") {
            w.fbq("track", "AddToCart", {
                content_name: product.name,
                content_ids: [product.id],
                content_type: "product",
                value: itemTotal,
                currency: "BDT",
            });
        }

        // TikTok Pixel
        if (typeof w.ttq === "function") {
            w.ttq.track("AddToCart", {
                content_id: product.id,
                content_name: product.name,
                content_type: "product",
                quantity,
                value: itemTotal,
                currency: "BDT",
            });
        }

        // Google Analytics
        if (typeof w.gtag === "function") {
            w.gtag("event", "add_to_cart", {
                currency: "BDT",
                value: itemTotal,
                items: [
                    {
                        item_id: product.id,
                        item_name: product.name,
                        price: product.price,
                        quantity,
                    },
                ],
            });
        }
    } catch (err) {
        console.warn("Tracking error in trackAddToCart:", err);
    }
}

/**
 * 3. InitiateCheckout / begin_checkout:
 * Fired when a customer navigates to the checkout page
 */
export function trackInitiateCheckout(items: TrackCartItem[], totalAmount: number) {
    if (typeof window === "undefined") return;
    const w = window as any;

    try {
        const totalQuantity = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
        const contentIds = items.map((item) => item.id);

        // Meta Pixel
        if (typeof w.fbq === "function") {
            w.fbq("track", "InitiateCheckout", {
                content_ids: contentIds,
                content_type: "product",
                value: totalAmount,
                currency: "BDT",
                num_items: totalQuantity,
            });
        }

        // TikTok Pixel
        if (typeof w.ttq === "function") {
            w.ttq.track("InitiateCheckout", {
                contents: items.map((item) => ({
                    content_id: item.id,
                    content_name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                })),
                value: totalAmount,
                currency: "BDT",
            });
        }

        // Google Analytics
        if (typeof w.gtag === "function") {
            w.gtag("event", "begin_checkout", {
                currency: "BDT",
                value: totalAmount,
                items: items.map((item) => ({
                    item_id: item.id,
                    item_name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                })),
            });
        }
    } catch (err) {
        console.warn("Tracking error in trackInitiateCheckout:", err);
    }
}

/**
 * 4. Purchase / CompletePayment:
 * Fired when an order is completed successfully
 */
export function trackPurchase(data: TrackPurchaseData) {
    if (typeof window === "undefined") return;
    const w = window as any;

    try {
        const { orderId, totalAmount, items = [] } = data;
        const totalQuantity = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
        const contentIds = items.map((item) => item.id);

        // Meta Pixel
        if (typeof w.fbq === "function") {
            w.fbq("track", "Purchase", {
                content_ids: contentIds.length > 0 ? contentIds : [orderId],
                content_type: "product",
                value: totalAmount,
                currency: "BDT",
                num_items: totalQuantity || 1,
            });
        }

        // TikTok Pixel
        if (typeof w.ttq === "function") {
            w.ttq.track("CompletePayment", {
                contents: items.map((item) => ({
                    content_id: item.id,
                    content_name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                })),
                value: totalAmount,
                currency: "BDT",
            });
        }

        // Google Analytics
        if (typeof w.gtag === "function") {
            w.gtag("event", "purchase", {
                transaction_id: orderId,
                value: totalAmount,
                currency: "BDT",
                items: items.map((item) => ({
                    item_id: item.id,
                    item_name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                })),
            });
        }
    } catch (err) {
        console.warn("Tracking error in trackPurchase:", err);
    }
}
