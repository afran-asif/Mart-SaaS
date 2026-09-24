// src/app/dashboard/orders/page.tsx
"use client";

import React, { Fragment, useEffect, useState, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { getAllOrders, updateOrderStatusApi, Order } from "@/services/orderService";
import { useTranslation } from "@/hooks/useTranslation";

const PAGE_SIZE = 10;

export default function OrdersPage() {
    const { t } = useTranslation();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalOrders, setTotalOrders] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    // Expanded row — row click করলেই detail
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Fetch orders (server-side paginated + filtered)
    const fetchOrders = useCallback(async (targetPage: number, search: string, status: string) => {
        try {
            setLoading(true);
            const data = await getAllOrders({
                page: targetPage,
                limit: PAGE_SIZE,
                search: search.trim() || undefined,
                status: status === "All" ? undefined : status,
            });
            setOrders(data.orders);
            setTotalOrders(data.totalOrders);
            setPage(data.page);
            setPages(data.pages || 1);
        } catch {
            toast.error("Failed to load orders. Please refresh.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders(1, "", "All");
    }, [fetchOrders]);

    // Search — debounce (500ms), status change হলে সাথে সাথেই refetch
    const searchDebounceRef = useRef<ReturnType<typeof setTimeout>>(null);
    const statusRef = useRef(statusFilter);
    statusRef.current = statusFilter;

    useEffect(() => {
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = setTimeout(() => {
            fetchOrders(1, searchTerm, statusRef.current);
        }, 500);
        return () => {
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        };
    }, [searchTerm, fetchOrders]);

    useEffect(() => {
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        fetchOrders(1, searchTerm, statusFilter);
    }, [statusFilter, fetchOrders]);

    const goToPage = (targetPage: number) => {
        if (targetPage < 1 || targetPage > pages || targetPage === page) return;
        fetchOrders(targetPage, searchTerm, statusFilter);
    };

    // Page number window
    const pageNumbers = (() => {
        const total = pages;
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        const nums: (number | "...")[] = [1];
        const start = Math.max(2, page - 1);
        const end = Math.min(total - 1, page + 1);
        if (start > 2) nums.push("...");
        for (let i = start; i <= end; i++) nums.push(i);
        if (end < total - 1) nums.push("...");
        nums.push(total);
        return nums;
    })();

    // Status Badge Styling Helper
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Pending":
                return "bg-yellow-50 text-yellow-700 border-yellow-200";
            case "Processing":
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "Delivered":
                return "bg-green-50 text-green-700 border-green-200";
            case "Cancelled":
                return "bg-red-50 text-red-700 border-red-200";
            default:
                return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "Pending":
                return t("dashboard.statusPending");
            case "Processing":
                return t("dashboard.statusProcessing");
            case "Delivered":
                return t("dashboard.statusDelivered");
            case "Cancelled":
                return t("dashboard.statusCancelled");
            default:
                return status;
        }
    };

    const formatDate = (dateString?: string | Date) => {
        if (!dateString) return "N/A";
        const d = new Date(dateString);
        return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString();
    };

    // Update Status Handler
    const handleStatusChange = async (orderId: string, newStatus: string) => {
        const toastId = toast.loading("Updating order status...");
        try {
            await updateOrderStatusApi(orderId, newStatus);
            setOrders((prev) =>
                prev.map((o) => (o._id === orderId ? { ...o, status: newStatus as any } : o))
            );
            toast.success("Order status updated!", { id: toastId });
        } catch (error: any) {
            toast.error(error.message || "Failed to update status.", { id: toastId });
        }
    };

    return (
        <div className="space-y-5 sm:space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("dashboard.ordersPage.title")}</h1>
                <p className="text-gray-500 mt-1 text-sm">{t("dashboard.ordersPage.subtitle")}</p>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-full relative">
                    <input
                        type="text"
                        placeholder={t("dashboard.ordersPage.searchPlaceholder")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm text-gray-900"
                    />
                    <span className="absolute left-3 top-3 text-gray-400 text-sm">🔍</span>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0">
                        {t("dashboard.ordersPage.statusLabel")}
                    </label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="flex-1 sm:flex-none px-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-orange-500 transition-colors text-sm text-gray-900"
                    >
                        <option value="All">{t("dashboard.ordersPage.allStatuses")}</option>
                        <option value="Pending">{t("dashboard.statusPending")}</option>
                        <option value="Processing">{t("dashboard.statusProcessing")}</option>
                        <option value="Delivered">{t("dashboard.statusDelivered")}</option>
                        <option value="Cancelled">{t("dashboard.statusCancelled")}</option>
                    </select>
                </div>
            </div>

            {/* Loading */}
            {loading && <p className="text-gray-600 font-medium p-4">{t("dashboard.ordersPage.loading")}</p>}

            {/* Orders Table */}
            {!loading && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {orders.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">
                            {t("dashboard.ordersPage.noOrdersFound")}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[560px]">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs sm:text-sm font-semibold">
                                        <th className="p-3 sm:p-4 pl-4 sm:pl-6">{t("dashboard.orderId")}</th>
                                        <th className="p-3 sm:p-4">{t("dashboard.customer")}</th>
                                        <th className="p-3 sm:p-4 hidden md:table-cell">{t("dashboard.date")}</th>
                                        <th className="p-3 sm:p-4">{t("dashboard.total")}</th>
                                        <th className="p-3 sm:p-4">{t("dashboard.status")}</th>
                                        <th className="p-3 sm:p-4 pr-4 sm:pr-6 text-right">
                                            <span className="inline-flex items-center gap-1">
                                                <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                                </svg>
                                                Detail
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-gray-700 text-xs sm:text-sm">
                                    {orders.map((order) => (
                                        <Fragment key={order._id}>
                                        <tr
                                            onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                                            className={`cursor-pointer transition-colors ${
                                                expandedId === order._id ? "bg-orange-50/40" : "hover:bg-gray-50/50"
                                            }`}
                                        >
                                            <td className="p-3 sm:p-4 pl-4 sm:pl-6 font-mono text-xs font-semibold text-gray-900">
                                                #{order._id.slice(-6).toUpperCase()}
                                            </td>
                                            <td className="p-3 sm:p-4">
                                                <div className="font-medium text-gray-950 text-xs sm:text-sm truncate max-w-[90px] sm:max-w-[140px]">{order.customerName}</div>
                                                <div className="text-[11px] text-gray-400 hidden sm:block truncate max-w-[140px]">{order.customerEmail}</div>
                                            </td>
                                            <td className="p-3 sm:p-4 text-xs text-gray-500 hidden md:table-cell">
                                                {formatDate(order.createdAt)}
                                            </td>
                                            <td className="p-3 sm:p-4 font-semibold text-gray-900 whitespace-nowrap text-xs sm:text-sm">
                                                ৳{order.totalAmount.toFixed(2)}
                                            </td>
                                            <td className="p-3 sm:p-4" onClick={(e) => e.stopPropagation()}>
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                    className={`px-2 py-1 text-xs font-semibold rounded-lg border focus:outline-none transition-colors cursor-pointer ${getStatusBadge(
                                                        order.status
                                                    )}`}
                                                >
                                                    <option value="Pending">{t("dashboard.statusPending")}</option>
                                                    <option value="Processing">{t("dashboard.statusProcessing")}</option>
                                                    <option value="Delivered">{t("dashboard.statusDelivered")}</option>
                                                    <option value="Cancelled">{t("dashboard.statusCancelled")}</option>
                                                </select>
                                            </td>
                                            <td className="p-3 sm:p-4 pr-4 sm:pr-6 text-right">
                                                <span
                                                    className={`inline-flex items-center transition-transform duration-200 ${
                                                        expandedId === order._id ? "rotate-180" : ""
                                                    }`}
                                                >
                                                    <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current text-gray-400" aria-hidden="true">
                                                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                                    </svg>
                                                </span>
                                            </td>
                                        </tr>
                                        {expandedId === order._id && (
                                            <tr className="bg-orange-50/30">
                                                <td colSpan={6} className="p-4 sm:p-5 pl-4 sm:pl-6 pr-4 sm:pr-6">
                                                    <OrderDetailRow order={order} t={t} />
                                                </td>
                                            </tr>
                                        )}
                                        </Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {orders.length > 0 && pages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-gray-100">
                            <p className="text-xs text-gray-500">
                                Page {page} of {pages} · {totalOrders} orders
                            </p>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => goToPage(page - 1)}
                                    disabled={page <= 1}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-orange-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    ← Prev
                                </button>
                                {pageNumbers.map((p, idx) =>
                                    p === "..." ? (
                                        <span key={`e-${idx}`} className="px-1.5 text-xs text-gray-400">
                                            …
                                        </span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => goToPage(p)}
                                            disabled={p === page}
                                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                                                p === page
                                                    ? "bg-orange-600 border-orange-600 text-white"
                                                    : "border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-orange-300"
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                )}
                                <button
                                    onClick={() => goToPage(page + 1)}
                                    disabled={page >= pages}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-orange-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Row expand করলে নিচে inline detail panel
function OrderDetailRow({ order, t }: { order: Order; t: (key: string) => string }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Items */}
            <div className="lg:col-span-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    {t("dashboard.ordersPage.itemsOrdered")}
                </h3>
                <div className="space-y-2.5">
                    {order.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                                {item.product?.images?.[0] ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={item.product.images[0]}
                                        alt={item.product?.name || "Product"}
                                        className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                                    />
                                ) : (
                                    <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700 shrink-0">
                                        📦
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs font-semibold text-gray-900">{item.product?.name || "Product"}</p>
                                    <p className="text-[11px] text-gray-500">Qty: {item.quantity} × ৳{item.price.toFixed(2)}</p>
                                </div>
                            </div>
                            <p className="text-xs font-bold text-gray-900 ml-2">
                                ৳{(item.quantity * item.price).toFixed(2)}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-100">
                    <span className="text-sm font-bold text-gray-700">{t("dashboard.ordersPage.grandTotal")}</span>
                    <span className="text-base font-extrabold text-orange-600">৳{order.totalAmount.toFixed(2)}</span>
                </div>
            </div>

            {/* Meta */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2.5 text-xs text-gray-600 self-start">
                <p>
                    <span className="font-semibold text-gray-800 mr-1">{t("dashboard.customer")}:</span>
                    {order.customerName}
                </p>
                <p className="break-all">
                    <span className="font-semibold text-gray-800 mr-1">Email:</span>
                    {order.customerEmail}
                </p>
                {order.phone && (
                    <p>
                        <span className="font-semibold text-gray-800 mr-1">Phone:</span>
                        {order.phone}
                    </p>
                )}
                <p>
                    <span className="font-semibold text-gray-800 mr-1">{t("dashboard.ordersPage.address")}:</span>
                    {order.shippingAddress}
                </p>
                <p>
                    <span className="font-semibold text-gray-800 mr-1">{t("dashboard.date")}:</span>
                    {new Date(order.createdAt).toLocaleString()}
                </p>
            </div>
        </div>
    );
}