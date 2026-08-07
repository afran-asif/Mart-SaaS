import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    user: { id: string; name: string; email: string; role: string } | null;
    store: { id?: string; storeName: string; subdomain: string } | null;
    isAuthenticated: boolean;
    token: string | null;
}

const initialState: AuthState = {
    user: null,
    store: null,
    token: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ user: any; store: any; token: string }>
        ) => {
            state.user = action.payload.user;
            state.store = action.payload.store;
            state.token = action.payload.token;
            state.isAuthenticated = true;

            if (typeof window !== "undefined") {
                localStorage.setItem("token", action.payload.token);
                localStorage.setItem("user", JSON.stringify(action.payload.user));
                localStorage.setItem("store", JSON.stringify(action.payload.store));
            }
        },
        rehydrate: (state) => {
            if (typeof window !== "undefined") {
                const token = localStorage.getItem("token");
                const userStr = localStorage.getItem("user");
                const storeStr = localStorage.getItem("store");

                if (token && userStr) {
                    try {
                        state.token = token;
                        state.user = JSON.parse(userStr);
                        state.store = storeStr ? JSON.parse(storeStr) : null;
                        state.isAuthenticated = true;
                    } catch {
                        // If JSON parse fails, clear storage
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        localStorage.removeItem("store");
                    }
                }
            }
        },
        logout: (state) => {
            state.user = null;
            state.store = null;
            state.token = null;
            state.isAuthenticated = false;

            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                localStorage.removeItem("store");
            }
        },
    },
});

export const { setCredentials, rehydrate, logout } = authSlice.actions;
export default authSlice.reducer;