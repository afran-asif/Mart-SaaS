"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";
import {
    listSubRequests, approveSubRequest, rejectSubRequest, SubRequest,
    getPlatformStats, PlatformStats, listAdminStores, AdminStore,
    setAdminStorePlan, setAdminStoreStatus, listAdminOrders, impersonateStore,
} from "@/services/adminService";

type MainTab = "requests" | "stores" | "orders";

export default function LocalizedAdminPage() {
    const { t } = useTranslation();
    const { user } = useSelector((state: any) => state.auth);
    const [mainTab, setMainTab] = useState<MainTab>("requests");

    // requests
    const [requests, setRequests] = useState<SubRequest[]>([]);
    const [reqTab, setReqTab] = useState("pending");
    // stores
    const [stores, setStores] = useState<AdminStore[]>([]);
    const [search, setSearch] = useState("");
    // orders
    const [orders, setOrders] = useState<any[]>([]);
    const [orderPage, setOrderPage] = useState(1);
    const [orderTotal, setOrderTotal] = useState(0);
    // stats
    const [stats, setStats] = useState<PlatformStats | null>(null);

    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState<string | null>(null);

    const isAdmin = user?.role === "super-admin";

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [s, r, st, o] = await Promise.all([
                getPlatformStats(),
                listSubRequests(reqTab),
                listAdminStores(search),
                listAdminOrders(orderPage),
            ]);
            setStats(s);
            setRequests(r);
            setStores(st);
            setOrders(o.orders);
            setOrderTotal(o.total);
        } catch (error: any) {
            toast.error(error.message || "Failed to load admin data.");
        } finally {
            setLoading(false);
        }
    }, [reqTab, search, orderPage]);

    useEffect(() => {
        if (isAdmin) fetchAll();
        else setLoading(false);
    }, [isAdmin, fetchAll]);

    if (!isAdmin) {
        return (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center max-w-md mx-auto">
                <h3 className="text-base font-bold text-gray-900">{t("dashboard.adminPage.forbidden")}</h3>
                <p className="text-sm text-gray-500 mt-1">{t("dashboard.adminPage.forbiddenDesc")}</p>
            </div>
        );
    }

    const handleApprove = async (id: string) => {
        if (!window.confirm(t("dashboard.adminPage.approveConfirm"))) return;
        setActing(id);
        try {
            await approveSubRequest(id);
            toast.success(t("dashboard.adminPage.approved"));
            fetchAll();
        } catch (error: any) {
            toast.error(error.message || "Approve failed.");
        } finally {
            setActing(null);
        }
    };

    const handleReject = async (id: string) => {
        const note = window.prompt(t("dashboard.adminPage.rejectNote") || "Reason (optional):") || "";
        setActing(id);
        try {
            await rejectSubRequest(id, note);
            toast.success(t("dashboard.adminPage.rejected"));
            fetchAll();
        } catch (error: any) {
            toast.error(error.message || "Reject failed.");
        } finally {
            setActing(null);
        }
    };

    const handlePlan = async (id: string, plan: string) => {
        const days = plan === "pro" ? Number(window.prompt("Days? (default 30)") || 30) : 0;
        if (plan === "pro" && (!days || days <= 0)) return;
        if (!window.confirm(plan === "pro" ? `Set PRO for ${days} days?` : "Set FREE?")) return;
        setActing(id);
        try {
            await setAdminStorePlan(id, plan, days);
            toast.success("Plan updated.");
            fetchAll();
        } catch (error: any) {
            toast.error(error.message || "Failed.");
        } finally {
            setActing(null);
        }
    };

    const handleStatus = async (id: string, status: string) => {
        if (!window.confirm(status === "suspended" ? "Suspend this store?" : "Activate this store?")) return;
        setActing(id);
        try {
            await setAdminStoreStatus(id, status);
            toast.success("Status updated.");
            fetchAll();
        } catch (error: any) {
            toast.error(error.message || "Failed.");
        } finally {
            setActing(null);
        }
    };

    const handleImpersonate = async (id: string, name: string) => {
        if (!window.confirm(`Open ${name} as vendor? (logged for audit)`)) return;
        try {
            const url = await impersonateStore(id);
            window.open(url, "_blank", "noopener");
        } catch (error: any) {
            toast.error(error.message || "Failed.");
        }
    };

    const storeLabel = (r: SubRequest) =>
        typeof r.storeId === "object" && r.storeId
            ? `${r.storeId.storeName || ""} (${r.storeId.subdomain || ""})`
            : String(r.storeId || "");

    const statCards = stats
        ? [
              { label: t("dashboard.adminPage.statStores"), value: stats.totalStores },
              { label: t("dashboard.adminPage.statPro"), value: stats.proStores },
              { label: t("dashboard.adminPage.statOrdersToday"), value: stats.todayOrders },
              { label: t("dashboard.adminPage.statOrdersMonth"), value: stats.monthOrders },
              { label: `৳ ${t("dashboard.adminPage.statRevenueMonth")}`, value: Math.round(stats.monthRevenue) },
              { label: t("dashboard.adminPage.statFailedMonth"), value: stats.failedOrdersMonth, alert: stats.failedOrdersMonth > 0 },
              { label: t("dashboard.adminPage.statSuspended"), value: stats.suspendedStores, alert: stats.suspendedStores > 0 },
              { label: t("dashboard.adminPage.statExpiring"), value: stats.expiringPro, alert: stats.expiringPro > 0 },
              { label: t("dashboard.adminPage.statPending"), value: stats.pendingRequests, alert: stats.pendingRequests > 0 },
          ]
        : [];

    return (
        <div className="space-y-5 sm:space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("dashboard.adminPage.title")}</h1>
                <p className="text-gray-500 mt-1 text-sm">{t("dashboard.adminPage.subtitle")}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {statCards.map((c: any) => (
                    <div key={c.label} className={`bg-white rounded-2xl p-4 border shadow-sm ${c.alert ? "border-red-200" : "border-gray-100"}`}>
                        <p className={`text-2xl font-extrabold ${c.alert ? "text-red-600" : "text-gray-900"}`}>{c.value}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{c.label}</p>
                    </div>
                ))}
            </div>

            {/* Main tabs */}
            <div className="flex gap-2">
                {(["requests", "stores", "orders"] as MainTab[]).map((m) => (
                    <button
                        key={m}
                        onClick={() => setMainTab(m)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${
                            mainTab === m ? "bg-orange-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                        }`}
                    >
                        {t(`dashboard.adminPage.tab${m[0].toUpperCase()}${m.slice(1)}`)}
                    </button>
                ))}
            </div>

            {loading ? (
                <p className="text-gray-600 p-4 bg-white rounded-2xl border border-gray-100">{t("dashboard.adminPage.loading")}</p>
            ) : (
                <>
                    {/* REQUESTS */}
                    {mainTab === "requests" && (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                {["pending", "active", "rejected"].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setReqTab(s)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${
                                            reqTab === s ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            {requests.length === 0 ? (
                                <p className="text-gray-500 p-6 bg-white rounded-2xl border border-gray-100 text-center text-sm">{t("dashboard.adminPage.empty")}</p>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {requests.map((r) => (
                                        <div key={r._id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-900 truncate">{storeLabel(r)}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{new Date(r.createdAt).toLocaleString()}</p>
                                                </div>
                                                <span className="font-mono font-bold text-orange-600">৳{r.amount}</span>
                                            </div>
                                            <div className="mt-3 bg-gray-50 rounded-xl p-3 text-xs space-y-1 font-mono">
                                                <p><span className="text-gray-400">TrxID:</span> <span className="font-bold">{r.trxId || "—"}</span></p>
                                                <p><span className="text-gray-400">Sender:</span> {r.senderNumber || "—"}</p>
                                                {r.adminNote && <p><span className="text-gray-400">Note:</span> {r.adminNote}</p>}
                                            </div>
                                            {reqTab === "pending" && (
                                                <div className="flex gap-2 mt-4">
                                                    <button
                                                        onClick={() => handleApprove(r._id)}
                                                        disabled={acting === r._id}
                                                        className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-colors disabled:opacity-60"
                                                    >
                                                        {t("dashboard.adminPage.approve")}
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(r._id)}
                                                        disabled={acting === r._id}
                                                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-60"
                                                    >
                                                        {t("dashboard.adminPage.reject")}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* STORES */}
                    {mainTab === "stores" && (
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t("dashboard.adminPage.searchStores")}
                                className="w-full sm:max-w-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 text-sm outline-none"
                            />
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {stores.map((s) => (
                                    <div key={s.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-900 truncate">{s.storeName}</p>
                                                <p className="text-xs font-mono text-gray-500 truncate">
                                                    {s.subdomain}{s.customDomain ? ` · ${s.customDomain}` : ""}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1 truncate">{s.vendorName} · {s.vendorEmail}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${s.plan === "pro" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"}`}>
                                                    {s.plan.toUpperCase()}
                                                </span>
                                                <span className={`text-[11px] font-semibold ${s.status === "active" ? "text-green-600" : "text-red-600"}`}>
                                                    ● {s.status}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            📦 {s.products} · 🧾 {s.orders}
                                            {s.planExpiresAt && s.plan === "pro" && ` · till ${new Date(s.planExpiresAt).toLocaleDateString()}`}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {s.plan === "pro" ? (
                                                <button onClick={() => handlePlan(s.id, "free")} disabled={acting === s.id} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:border-gray-400 disabled:opacity-60">
                                                    Set Free
                                                </button>
                                            ) : (
                                                <button onClick={() => handlePlan(s.id, "pro")} disabled={acting === s.id} className="px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 disabled:opacity-60">
                                                    Make Pro
                                                </button>
                                            )}
                                            {s.status === "active" ? (
                                                <button onClick={() => handleStatus(s.id, "suspended")} disabled={acting === s.id} className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-60">
                                                    Suspend
                                                </button>
                                            ) : (
                                                <button onClick={() => handleStatus(s.id, "active")} disabled={acting === s.id} className="px-3 py-1.5 rounded-lg border border-green-200 text-xs font-bold text-green-700 hover:bg-green-50 disabled:opacity-60">
                                                    Activate
                                                </button>
                                            )}
                                            <button onClick={() => handleImpersonate(s.id, s.storeName)} className="px-3 py-1.5 rounded-lg border border-blue-200 text-xs font-bold text-blue-700 hover:bg-blue-50">
                                                👁 {t("dashboard.adminPage.loginAs")}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ORDERS */}
                    {mainTab === "orders" && (
                        <div className="space-y-4">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                                {orders.map((o: any) => (
                                    <div key={o._id} className="p-4 flex items-center justify-between gap-3 text-sm">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-800 truncate">{o.customerName}</p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {(o.storeId as any)?.storeName || ""} · {o.status} · {o.paymentStatus}
                                            </p>
                                        </div>
                                        <span className="font-mono font-bold text-gray-800 shrink-0">৳{o.totalAmount}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">Total: {orderTotal}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setOrderPage(Math.max(1, orderPage - 1))} disabled={orderPage <= 1} className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold disabled:opacity-40">←</button>
                                    <span className="px-2 py-2 text-xs font-mono">{orderPage}</span>
                                    <button onClick={() => setOrderPage(orderPage + 1)} disabled={orders.length < 15} className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold disabled:opacity-40">→</button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}