import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
    _id: string;
    name: string;
    price: number;
    image?: string;
    images?: string[];
    quantity: number;
    stock?: number;
}

interface CartState {
    items: CartItem[];
    totalQuantity: number;
    totalAmount: number;
    hydrated: boolean;   // ✅ নতুন ফ্ল্যাগ
    buyNowItem: CartItem | null;  // Buy Now এর জন্য আলাদা item
    selectedIds: string[] | null;  // null মানে সব সিলেক্টেড (checkout-এর জন্য)
}

const initialState: CartState = {
    items: [],
    totalQuantity: 0,
    totalAmount: 0,
    hydrated: false,   // ✅ শুরুতে false
    buyNowItem: null,
    selectedIds: null,
};

// Helper — totalQuantity ও totalAmount হিসাব করা
const calculateTotals = (items: CartItem[]) => {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { totalQuantity, totalAmount };
};

// Helper — dynamic storage key বানানো (subdomain অনুযায়ী)
const getCartStorageKey = (): string => {
    if (typeof window === "undefined") return "mart_cart";
    const hostname = window.location.hostname;
    const subdomain = hostname.split(".")[0];
    return `mart_cart_${subdomain}`;
};

// Helper — localStorage-এ সেভ করা
const saveCartToStorage = (items: CartItem[]) => {
    if (typeof window !== "undefined") {
        localStorage.setItem(getCartStorageKey(), JSON.stringify(items));
    }
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (
            state,
            action: PayloadAction<{ product: any; quantity?: number }>
        ) => {
            const { product, quantity = 1 } = action.payload;
            const existingItem = state.items.find((item) => item._id === product._id);

            const image =
                product.images && product.images.length > 0
                    ? product.images[0]
                    : product.image || "/placeholder.png";

            if (existingItem) {
                const maxStock = product.stock ?? existingItem.stock ?? 999;
                const newQuantity = existingItem.quantity + quantity;
                existingItem.quantity = Math.min(newQuantity, maxStock);
            } else {
                state.items.push({
                    _id: product._id,
                    name: product.name,
                    price: Number(product.price || 0),
                    image,
                    images: product.images,
                    quantity: Math.min(quantity, product.stock ?? 999),
                    stock: product.stock,
                });
            }

            const totals = calculateTotals(state.items);
            state.totalQuantity = totals.totalQuantity;
            state.totalAmount = totals.totalAmount;
            saveCartToStorage(state.items);

            // নতুন item default selected
            if (state.selectedIds !== null && !state.selectedIds.includes(product._id)) {
                state.selectedIds.push(product._id);
            }
        },

        decreaseQuantity: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            const existingItem = state.items.find((item) => item._id === id);

            // Quantity 1-এর নিচে নামবে না — remove করতে হলে removeFromCart ব্যবহার করো
            if (existingItem && existingItem.quantity > 1) {
                existingItem.quantity -= 1;
            }

            const totals = calculateTotals(state.items);
            state.totalQuantity = totals.totalQuantity;
            state.totalAmount = totals.totalAmount;
            saveCartToStorage(state.items);
        },

        removeFromCart: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((item) => item._id !== action.payload);
            if (state.selectedIds !== null) {
                state.selectedIds = state.selectedIds.filter((id) => id !== action.payload);
            }
            const totals = calculateTotals(state.items);
            state.totalQuantity = totals.totalQuantity;
            state.totalAmount = totals.totalAmount;
            saveCartToStorage(state.items);
        },

        clearCart: (state) => {
            state.items = [];
            state.totalQuantity = 0;
            state.totalAmount = 0;
            state.selectedIds = null;
            if (typeof window !== "undefined") {
                localStorage.removeItem(getCartStorageKey());
            }
        },

        rehydrateCart: (state) => {
            if (typeof window !== "undefined") {
                const cartData = localStorage.getItem(getCartStorageKey());
                if (cartData) {
                    try {
                        const items: CartItem[] = JSON.parse(cartData);
                        state.items = items;
                        const totals = calculateTotals(items);
                        state.totalQuantity = totals.totalQuantity;
                        state.totalAmount = totals.totalAmount;
                    } catch {
                        localStorage.removeItem(getCartStorageKey());
                    }
                }
            }
            state.hydrated = true;
            state.selectedIds = null;
        },

        setBuyNow: (state, action: PayloadAction<any>) => {
            const product = action.payload;
            const image =
                product.images && product.images.length > 0
                    ? product.images[0]
                    : product.image || "/placeholder.png";
            state.buyNowItem = {
                _id: product._id,
                name: product.name,
                price: Number(product.price || 0),
                image,
                images: product.images,
                quantity: 1,
                stock: product.stock,
            };
        },

        clearBuyNow: (state) => {
            state.buyNowItem = null;
        },

        updateBuyNowQuantity: (state, action: PayloadAction<number>) => {
            if (state.buyNowItem) {
                const maxStock = state.buyNowItem.stock ?? 999;
                state.buyNowItem.quantity = Math.min(Math.max(action.payload, 1), maxStock);
            }
        },

        // Cart item select/deselect (checkout-এর জন্য)
        toggleSelectItem: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            if (state.selectedIds === null) {
                state.selectedIds = state.items.filter((item) => item._id !== id).map((item) => item._id);
            } else if (state.selectedIds.includes(id)) {
                state.selectedIds = state.selectedIds.filter((selectedId) => selectedId !== id);
            } else {
                state.selectedIds.push(id);
            }
        },

        setSelectAll: (state, action: PayloadAction<boolean>) => {
            state.selectedIds = action.payload ? null : [];
        },

        // Server থেকে fresh price/stock sync (বিক্রেতা দাম বদলালে কার্টে update হয়)
        syncCartPrices: (state, action: PayloadAction<{ _id: string; price?: number; stock?: number; name?: string }[]>) => {
            const freshProducts = action.payload;
            if (!freshProducts || freshProducts.length === 0) return;

            const freshMap = new Map(freshProducts.map((p) => [p._id, p]));

            // কাটা (ডিলিট হওয়া) প্রোডাক্ট বাদ
            state.items = state.items.filter((item) => freshMap.has(item._id));

            if (state.buyNowItem && freshMap.has(state.buyNowItem._id)) {
                const fresh = freshMap.get(state.buyNowItem._id)!;
                if (typeof fresh.price === "number") state.buyNowItem.price = fresh.price;
                if (typeof fresh.stock === "number") state.buyNowItem.stock = fresh.stock;
                if (typeof fresh.name === "string") state.buyNowItem.name = fresh.name;
                if (
                    typeof fresh.stock === "number" &&
                    fresh.stock > 0 &&
                    state.buyNowItem.quantity > fresh.stock
                ) {
                    state.buyNowItem.quantity = fresh.stock;
                }
            }

            for (const item of state.items) {
                const fresh = freshMap.get(item._id);
                if (!fresh) continue;
                if (typeof fresh.price === "number") item.price = fresh.price;
                if (typeof fresh.stock === "number") item.stock = fresh.stock;
                if (typeof fresh.name === "string") item.name = fresh.name;
                if (typeof fresh.stock === "number" && fresh.stock > 0 && item.quantity > fresh.stock) {
                    item.quantity = fresh.stock;
                }
            }

            const totals = calculateTotals(state.items);
            state.totalQuantity = totals.totalQuantity;
            state.totalAmount = totals.totalAmount;
            saveCartToStorage(state.items);
        },
    },
});

export const {
    addToCart,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    rehydrateCart,
    setBuyNow,
    clearBuyNow,
    updateBuyNowQuantity,
    toggleSelectItem,
    setSelectAll,
    syncCartPrices,
} = cartSlice.actions;

export default cartSlice.reducer;
