"use client";

import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "./store";
import { rehydrate } from "./authSlice";
import { rehydrateCart } from "./cartSlice";
import { rehydrateLanguage } from "./languageSlice";

function AuthInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(rehydrate());
        dispatch(rehydrateCart());
        dispatch(rehydrateLanguage());
    }, [dispatch]);

    return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <AuthInitializer>{children}</AuthInitializer>
        </Provider>
    );
}