"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/redux/authSlice";
import { logoutVendor } from "@/services/authService";
import { getOrderNotifications, markOrderSeen, markAllSeen, OrderNotification } from "@/services/orderService";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function DashboardTopbar({
    onMenuClick,
    basePath,
    onSignOut,
}: {
    onMenuClick: () => void;
    basePath: string;
    onSignOut: () => void;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { user, store } = useSelector((state: any) => state.auth);
    const [pending, setPending] = useState(0);    const [notifs, setNotifs] = useState<OrderNotification[]>([]);
    const [bellOpen, setBellOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const bellRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            const data = await getOrderNotifications();
            if (!cancelled) {
                setPending(data.count);
                setNotifs(data.orders);
            }
        };
        load();
        const id = setInterval(load, 60000);
        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, [pathname]);

    useEffect(() => {
        const close = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
            if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
                setBellOpen(false);
            }
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    const timeAgo = (d: string) => {
        const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
        if (mins < 1) return t("dashboard.justNow");
        if (mins < 60) return `${mins}m`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h`;
        return new Date(d).toLocaleDateString();
    };

    const handleNotifClick = async (id: string) => {
        setNotifs((prev) => prev.filter((o) => o._id !== id));
        setPending((p) => Math.max(0, p - 1));
        setBellOpen(false);
        await markOrderSeen(id);
        router.push(`${basePath}/orders`);
    };

    const handleMarkAllSeen = async () => {
        setNotifs([]);
        setPending(0);
        await markAllSeen();
    };

    const handleSignOut = async () => {
        try {
            await logoutVendor();
        } catch {
            // server fail হলেও client clear হবে
        }
        dispatch(logout());
        setMenuOpen(false);
        onSignOut();
    };

    return (
        <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 shrink-0 gap-3">
            <div className="flex items-center gap-3 min-w-0">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                    aria-label="Open menu"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <h1 className="flex items-center gap-2 min-w-0">
                    {(store as any)?.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={(store as any).logo}
                            alt={store?.storeName || ""}
                            className="w-7 h-7 rounded-lg object-cover ring-1 ring-gray-200 shrink-0"
                        />
                    ) : (
                        <span className="w-7 h-7 rounded-lg bg-orange-600 text-white font-bold text-xs flex items-center justify-center shrink-0 ring-1 ring-orange-700/30">
                            {(store?.storeName || user?.name || "S").charAt(0).toUpperCase()}
                        </span>
                    )}
                    <span className="text-sm sm:text-base font-bold text-gray-900">
                        {store?.storeName || user?.name || ""}
                    </span>
                </h1>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3">
                <LanguageSwitcher variant="dark" />
                {/* Notification bell + preview dropdown */}
                <div className="relative" ref={bellRef}>
                    <button
                        onClick={() => setBellOpen(!bellOpen)}
                        className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                        aria-label={t("dashboard.pendingOrders")}
                        title={t("dashboard.pendingOrders")}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {pending > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center">
                                {pending > 99 ? "99+" : pending}
                            </span>
                        )}
                    </button>
                    {bellOpen && (
                        <div className="absolute right-0 mt-2 w-80 max-w-[85vw] bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden z-40">
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    {t("dashboard.newNotifications")}
                                </p>
                                {notifs.length > 0 && (
                                    <button
                                        onClick={handleMarkAllSeen}
                                        className="text-[11px] font-bold text-orange-600 hover:text-orange-700"
                                    >
                                        {t("dashboard.markAllSeen")}
                                    </button>
                                )}
                            </div>
                            {notifs.length === 0 ? (
                                <p className="px-4 py-6 text-sm text-gray-400 text-center">{t("dashboard.noNewNotifications")}</p>
                            ) : (
                                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                                    {notifs.map((o) => (
                                        <button
                                            key={o._id}
                                            onClick={() => handleNotifClick(o._id)}
                                            className="w-full text-left px-4 py-3 hover:bg-orange-50/50 transition-colors flex items-center gap-3"
                                        >
                                            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                                            <span className="flex-1 min-w-0">
                                                <span className="block text-sm font-semibold text-gray-800 truncate">{o.customerName}</span>
                                                <span className="block text-[11px] text-gray-400">
                                                    {o.paymentMethod === "COD" ? "COD" : "Online"} · {timeAgo(o.createdAt)}
                                                </span>
                                            </span>
                                            <span className="font-mono text-sm font-bold text-gray-800 shrink-0">৳{o.totalAmount}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            <Link
                                href={`${basePath}/orders`}
                                onClick={() => setBellOpen(false)}
                                className="block text-center px-4 py-2.5 text-xs font-bold text-orange-600 hover:bg-orange-50 border-t border-gray-100 transition-colors"
                            >
                                {t("dashboard.viewAllOrders")}
                            </Link>
                        </div>
                    )}
                </div>

                {/* Avatar + dropdown */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="w-9 h-9 rounded-full bg-orange-600 text-white font-bold text-sm flex items-center justify-center hover:bg-orange-700 transition-colors overflow-hidden"
                        aria-label="Account menu"
                    >
                        {user?.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.avatar} alt={user?.name || "Account"} className="w-full h-full object-cover" />
                        ) : (
                            (user?.name || user?.email || "V").charAt(0).toUpperCase()
                        )}
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden z-40">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || t("dashboard.vendor")}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                {store?.storeName && (
                                    <p className="text-xs text-orange-600 font-medium truncate mt-0.5">{store.storeName}</p>
                                )}
                            </div>
                            <Link
                                href={`${basePath}/profile`}
                                onClick={() => setMenuOpen(false)}
                                className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                {t("dashboard.profile")}
                            </Link>
                            <Link
                                href={`${basePath}/billing`}
                                onClick={() => setMenuOpen(false)}
                                className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                {t("dashboard.billing")}
                            </Link>
                            <Link
                                href={`${basePath}/settings`}
                                onClick={() => setMenuOpen(false)}
                                className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                {t("dashboard.storeSettings")}
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                            >
                                {t("dashboard.signOut")}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
