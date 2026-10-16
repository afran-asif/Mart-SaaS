"use client";

import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { store } from "./store";
import { rehydrateCart } from "./cartSlice";
import { rehydrateLanguage } from "./languageSlice";
import SentryInit from "@/components/SentryInit";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

function AuthInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(rehydrateCart());
        dispatch(rehydrateLanguage());
    }, [dispatch]);

    return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
    const content = (
        <Provider store={store}>
            <SentryInit />
            <AuthInitializer>{children}</AuthInitializer>
        </Provider>
    );
    // Client ID না থাকলে Google provider ছাড়াই চলবে (button auto-hide)
    if (!googleClientId) return content;
    return <GoogleOAuthProvider clientId={googleClientId}>{content}</GoogleOAuthProvider>;
}