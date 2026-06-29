"use client"

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/redux/authSlice"
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const dispatch = useDispatch();
    const { user, store } = useSelector((state: any) => state.auth);
    const router = useRouter();
    const menuItems = [
        { name: "Overview", path: "/dashboard" },
        { name: "My Products", path: "/dashboard/products" },
        { name: "Orders", path: "/dashboard/orders" },
        { name: "Store Settings", path: "/dashboard/settings" },
    ];
    const handleSignOut = () => {
        // redux clear
        dispatch(logout());
        localStorage.removeItem("token");
        router.push("/login");
        };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md flex flex-col justify-between">
            <div className="p-6">
            <h2 className="text-2xl font-bold text-orange-600">MARTsaas</h2>
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

        <main className="flex-1 overflow-y-auto p-10">{children}</main>
        </div>
    );
}