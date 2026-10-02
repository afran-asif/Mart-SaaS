import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    user: { id: string; name: string; email: string; role: string } | null;
    store: { id?: string; storeName: string; subdomain: string } | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    store: null,
    isAuthenticated: false,
};

// Auth শুধু in-memory + httpOnly cookie — localStorage-এ token/user রাখা হয় না (XSS-safe).
// Refresh হলে shell /auth/me দিয়ে session restore করে।
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ user: any; store: any }>
        ) => {
            state.user = action.payload.user;
            state.store = action.payload.store;
            state.isAuthenticated = true;
        },
        setUser: (state, action: PayloadAction<any>) => {
            state.user = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.store = null;
            state.isAuthenticated = false;
        },
        updateStoreInfo: (
            state,
            action: PayloadAction<{ id?: string; storeName?: string; subdomain?: string; logo?: string | null }>
        ) => {
            if (state.store) {
                state.store = { ...state.store, ...action.payload };
            } else {
                state.store = action.payload as AuthState["store"];
            }
        },
    },
});

export const { setCredentials, setUser, logout, updateStoreInfo } = authSlice.actions;
export default authSlice.reducer;