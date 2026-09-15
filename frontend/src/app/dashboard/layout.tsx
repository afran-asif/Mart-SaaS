"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/redux/authSlice";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const dispatch = useDispatch();
    const router = useRouter();
    const { user, store, isAuthenticated } = useSelector((state: any) => state.auth);
    const [authChecked, setAuthChecked] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token && !isAuthenticated) {
            router.replace("/login");
        } else {
            setAuthChecked(true);
        }
    }, [isAuthenticated, router]);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    const menuItems = [
        { name: "Overview", path: "/dashboard" },
        { name: "My Products", path: "/dashboard/products" },
        { name: "Orders", path: "/dashboard/orders" },
        { name: "Store Settings", path: "/dashboard/settings" },
    ];

    const handleSignOut = () => {
        dispatch(logout());
        router.push("/login");
    };

    if (!authChecked) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3 text-gray-400">
                    <div className="w-8 h-8 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                    <p className="text-xs font-medium">Checking authorization...</p>
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
                        <h2 className="text-2xl font-bold text-orange-600">MARTsaas</h2>
                        {/* Close button (mobile only) */}
                        <button
                            className="lg:hidden text-gray-400 hover:text-gray-700 text-2xl leading-none"
                            onClick={() => setSidebarOpen(false)}
                        >
                            ×
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Shop: {store?.storeName || "My Store"}</p>

                    <nav className="mt-8 space-y-2">
                        {menuItems.map((item) => {
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
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t border-gray-200 flex flex-col gap-2">
                    <div className="px-2">
                        <p className="text-sm font-semibold text-gray-800">{user?.name || "Vendor"}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        Sign Out
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
                    <h2 className="text-lg font-bold text-orange-600">MARTsaas</h2>
                    <div className="w-9" /> {/* Spacer to center the title */}
                </div>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">{children}</main>
            </div>
        </div>
    );
}