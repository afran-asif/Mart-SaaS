"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logout, setCredentials } from "@/redux/authSlice";
import { fetchMe, logoutVendor } from "@/services/authService";
import { useTranslation } from "@/hooks/useTranslation";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const dispatch = useDispatch();
    const router = useRouter();
    const { user, store, isAuthenticated } = useSelector((state: any) => state.auth);
    const [authChecked, setAuthChecked] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [impersonated, setImpersonated] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (isAuthenticated) {
                setAuthChecked(true);
                return;
            }
            // Refresh-safe session restore — httpOnly cookie দিয়ে server যাচাই করে
            try {
                const data = await fetchMe();
                if (!cancelled && data?.success) {
                    dispatch(setCredentials({ user: data.user, store: data.store }));
                    if (data.impersonatedBy) setImpersonated(true);
                    setAuthChecked(true);
                }
            } catch {
                if (!cancelled) router.replace("/login");
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, router, dispatch]);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

const menuItems = [
        { nameKey: "dashboard.overview", path: "/dashboard" },
        { nameKey: "dashboard.myProducts", path: "/dashboard/products" },
        { nameKey: "dashboard.categories", path: "/dashboard/categories" },
        { nameKey: "dashboard.orders", path: "/dashboard/orders" },
        { nameKey: "dashboard.customers", path: "/dashboard/customers" },
        { nameKey: "dashboard.coupons", path: "/dashboard/coupons" },
        { nameKey: "dashboard.reviews", path: "/dashboard/reviews" },
        { nameKey: "dashboard.billing", path: "/dashboard/billing" },
        ...(user?.role === "super-admin" ? [{ nameKey: "dashboard.admin", path: "/dashboard/admin" }] : []),
        {
            nameKey: "dashboard.storeSettings",
            path: "/dashboard/settings",
            children: [
                { nameKey: "dashboard.settingsTabs.identity", path: "/dashboard/settings" },
                { nameKey: "dashboard.settingsTabs.payments", path: "/dashboard/settings/payments" },
                { nameKey: "dashboard.settingsTabs.domain", path: "/dashboard/settings/domain" },
                { nameKey: "dashboard.settingsTabs.marketing", path: "/dashboard/settings/marketing" },
                { nameKey: "dashboard.settingsTabs.branding", path: "/dashboard/settings/branding" },
                { nameKey: "dashboard.settingsTabs.social", path: "/dashboard/settings/social" },
            ],
        },
    ];

    const settingsBase = "/dashboard/settings";
    const [settingsOpen, setSettingsOpen] = useState(false);

    // Settings sub-page-এ থাকলে group auto-expand
    useEffect(() => {
        if (pathname.startsWith(settingsBase)) {
            setSettingsOpen(true);
        }
    }, [pathname]);

    const handleSignOut = async () => {
        try {
            await logoutVendor();
        } catch {
            // server cookie clear fail হলেও client state clear হবে
        }
        dispatch(logout());
        router.push("/login");
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
                <div className="p-6 flex flex-col min-h-0 flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/favicon.ico" alt="Vendoo" className="w-8 h-8 rounded-lg shadow-md shadow-orange-500/20" />
                            <h2 className="text-2xl font-bold text-orange-600">Vendoo</h2>
                        </div>
                        {/* Close button (mobile only) */}
                        <button
                            className="lg:hidden text-gray-400 hover:text-gray-700 text-2xl leading-none"
                            onClick={() => setSidebarOpen(false)}
                        >
                            ×
                        </button>
                    </div>

                    <nav className="mt-8 space-y-2 overflow-y-auto min-h-0 flex-1 pr-1">
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

                <div className="p-4 border-t border-gray-200 shrink-0">
                    <div className="flex items-center gap-3 px-2">
                        <span className="w-9 h-9 rounded-lg bg-orange-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                            {(user?.name || user?.email || "V").charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || t("dashboard.vendor")}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <DashboardTopbar
                    onMenuClick={() => setSidebarOpen(true)}
                    basePath="/dashboard"
                    onSignOut={() => router.push("/login")}
                />
                {/* Impersonation banner — support mode */}
                {impersonated && (
                    <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between gap-3 text-xs font-semibold shrink-0">
                        <span>👁 {t("dashboard.impersonateBanner")}</span>
                        <button
                            onClick={handleSignOut}
                            className="bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1 transition-colors whitespace-nowrap"
                        >
                            {t("dashboard.impersonateExit")}
                        </button>
                    </div>
                )}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">{children}</main>
            </div>
        </div>
    );
}