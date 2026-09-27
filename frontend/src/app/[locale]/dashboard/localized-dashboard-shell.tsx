"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logout, updateStoreInfo } from "@/redux/authSlice";
import { api } from "@/services/api";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function LocalizedDashboardShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const dispatch = useDispatch();
    const router = useRouter();
    const { user, store, isAuthenticated } = useSelector((state: any) => state.auth);
    const [authChecked, setAuthChecked] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { t, language } = useTranslation();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token && !isAuthenticated) {
            router.replace(`/${language}/login`);
        } else {
            setAuthChecked(true);
        }
    }, [isAuthenticated, router, language]);

    // Sidebar-এ সবসময় fresh store name (settings এ পরিবর্তন হলে immediate update)
    useEffect(() => {
        if (!isAuthenticated) return;
        let cancelled = false;
        const syncStore = async () => {
            try {
                const res = await api.get("/store/config");
                if (!cancelled && res.data?.store) {
                    dispatch(
                        updateStoreInfo({
                            id: res.data.store.id,
                            storeName: res.data.store.storeName,
                            subdomain: res.data.store.subdomain,
                            logo: res.data.store.logo,
                        })
                    );
                }
            } catch {
                // silent — token না থাকলে dashboard এ ঢুকতেই পারবে না
            }
        };
        syncStore();
        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, dispatch]);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    const menuItems = [
        { nameKey: "dashboard.overview", path: `/${language}/dashboard` },
        { nameKey: "dashboard.myProducts", path: `/${language}/dashboard/products` },
        { nameKey: "dashboard.categories", path: `/${language}/dashboard/categories` },
        { nameKey: "dashboard.orders", path: `/${language}/dashboard/orders` },
        { nameKey: "dashboard.customers", path: `/${language}/dashboard/customers` },
        { nameKey: "dashboard.coupons", path: `/${language}/dashboard/coupons` },
        { nameKey: "dashboard.billing", path: `/${language}/dashboard/billing` },
        ...(user?.role === "super-admin"
            ? [{ nameKey: "dashboard.admin", path: `/${language}/dashboard/admin` }]
            : []),
        {
            nameKey: "dashboard.storeSettings",
            path: `/${language}/dashboard/settings`,
            children: [
                { nameKey: "dashboard.settingsTabs.identity", path: `/${language}/dashboard/settings` },
                { nameKey: "dashboard.settingsTabs.payments", path: `/${language}/dashboard/settings/payments` },
                { nameKey: "dashboard.settingsTabs.domain", path: `/${language}/dashboard/settings/domain` },
                { nameKey: "dashboard.settingsTabs.marketing", path: `/${language}/dashboard/settings/marketing` },
                { nameKey: "dashboard.settingsTabs.branding", path: `/${language}/dashboard/settings/branding` },
                { nameKey: "dashboard.settingsTabs.social", path: `/${language}/dashboard/settings/social` },
            ],
        },
    ];

    const settingsBase = `/${language}/dashboard/settings`;
    const [settingsOpen, setSettingsOpen] = useState(false);

    // Settings sub-page-এ থাকলে group auto-expand
    useEffect(() => {
        if (pathname.startsWith(settingsBase)) {
            setSettingsOpen(true);
        }
    }, [pathname, settingsBase]);

    const handleSignOut = () => {
        dispatch(logout());
        router.push(`/${language}/login`);
    };

    if (!authChecked) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3 text-gray-400">
                    <div className="w-8 h-8 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                    <p className="text-xs font-medium">{t("dashboard.checkingAuth")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white shadow-md flex flex-col justify-between transform transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <Link href={`/${language}`}>
                            <h2 className="text-2xl font-bold text-orange-600">Vendoo</h2>
                        </Link>
                        {/* Close button (mobile only) */}
                        <button
                            className="lg:hidden text-gray-400 hover:text-gray-700 text-2xl leading-none"
                            onClick={() => setSidebarOpen(false)}
                        >
                            ×
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t("dashboard.shop")}: {store?.storeName || "My Store"}</p>

                    <nav className="mt-8 space-y-2">
                        {menuItems.map((item: any) => {
                            if (item.children) {
                                const isActiveGroup = pathname === item.path || pathname.startsWith(item.path + "/");
                                return (
                                    <div key={item.path}>
                                        <div
                                            className={`flex items-center rounded-lg transition-colors ${
                                                isActiveGroup
                                                    ? "bg-orange-50 text-orange-600"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            }`}
                                        >
                                            <Link
                                                href={item.path}
                                                className={`flex-1 px-4 py-2.5 text-sm font-medium border-l-4 ${
                                                    isActiveGroup ? "border-orange-600" : "border-transparent"
                                                }`}
                                            >
                                                {t(item.nameKey)}
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => setSettingsOpen(!settingsOpen)}
                                                className="px-3 py-2.5 text-gray-400 hover:text-gray-700"
                                                aria-label="Toggle settings submenu"
                                            >
                                                <span className={`inline-block transition-transform ${settingsOpen ? "rotate-90" : ""}`}>
                                                    ›
                                                </span>
                                            </button>
                                        </div>
                                        {settingsOpen && (
                                            <div className="ml-4 mt-1 space-y-1 border-l border-gray-100 pl-2">
                                                {item.children.map((child: any) => {
                                                    const isChildActive = pathname === child.path;
                                                    return (
                                                        <Link
                                                            key={child.path}
                                                            href={child.path}
                                                            className={`block px-3 py-1.5 text-[13px] font-medium rounded-lg transition-colors ${
                                                                isChildActive
                                                                    ? "bg-orange-50 text-orange-600"
                                                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                                            }`}
                                                        >
                                                            {t(child.nameKey)}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                            const isActive = pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                        isActive
                                            ? "bg-orange-50 text-orange-600 border-l-4 border-orange-600"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                                >
                                    {t(item.nameKey)}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t border-gray-200 flex flex-col gap-2">
                    {/* Language Switcher in sidebar */}
                    <div className="px-2 pb-1">
                        <LanguageSwitcher variant="dark" />
                    </div>
                    <div className="px-2">
                        <p className="text-sm font-semibold text-gray-800">{user?.name || t("dashboard.vendor")}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        {t("dashboard.signOut")}
                    </button>
                </div>
            </aside>

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Top Bar */}
                <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 shrink-0">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                        aria-label="Open menu"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <Link href={`/${language}`}>
                        <h2 className="text-lg font-bold text-orange-600">Vendoo</h2>
                    </Link>
                    <div className="w-9" />
                </div>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">{children}</main>
            </div>
        </div>
    );
}