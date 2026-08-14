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
}

const initialState: CartState = {
    items: [],
    totalQuantity: 0,
    totalAmount: 0,
    hydrated: false,   // ✅ শুরুতে false
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
        },

        decreaseQuantity: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            const existingItem = state.items.find((item) => item._id === id);

            if (existingItem) {
                if (existingItem.quantity > 1) {
                    existingItem.quantity -= 1;
                } else {
                    state.items = state.items.filter((item) => item._id !== id);
                }
            }

            const totals = calculateTotals(state.items);
            state.totalQuantity = totals.totalQuantity;
            state.totalAmount = totals.totalAmount;
            saveCartToStorage(state.items);
        },

        removeFromCart: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((item) => item._id !== action.payload);
            const totals = calculateTotals(state.items);
            state.totalQuantity = totals.totalQuantity;
            state.totalAmount = totals.totalAmount;
            saveCartToStorage(state.items);
        },

        clearCart: (state) => {
            state.items = [];
            state.totalQuantity = 0;
            state.totalAmount = 0;
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
        },
    },
});

export const {
    addToCart,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    rehydrateCart,
} = cartSlice.actions;

export default cartSlice.reducer;
