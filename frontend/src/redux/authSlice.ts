import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    user: { id: string; name: string; email: string; role: string } | null;
    store: { storeName: string; subdomain: string } | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    store: null,
    isAuthenticated: false,
};

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
        logout: (state) => {
            state.user = null;
            state.store = null;
            state.isAuthenticated = false;
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;