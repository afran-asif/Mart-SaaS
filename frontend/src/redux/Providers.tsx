"use client";

import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "./store";
import { rehydrateCart } from "./cartSlice";
import { rehydrateLanguage } from "./languageSlice";
import SentryInit from "@/components/SentryInit";

function AuthInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(rehydrateCart());
        dispatch(rehydrateLanguage());
    }, [dispatch]);

    return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <SentryInit />
            <AuthInitializer>{children}</AuthInitializer>
        </Provider>
    );
}