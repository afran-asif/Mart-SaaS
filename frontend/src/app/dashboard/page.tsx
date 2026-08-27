"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { api } from "@/services/api";

interface RecentOrder {
    _id: string;
    customerName: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
}

interface Analytics {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    statusBreakdown: Record<string, number>;
    paymentBreakdown: Record<string, number>;
    recentOrders: RecentOrder[];
}

const statusColors: Record<string, string> = {
    Pending: "bg-yellow-500",
    Processing: "bg-blue-500",
    Delivered: "bg-green-600",
    Cancelled: "bg-red-500",
};

export default function DashboardPage() {
    const { user } = useSelector((state: any) => state.auth);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchAnalytics = async () => {
            try {
                const res = await api.get("/orders/analytics");
                if (isMounted) setAnalytics(res.data.analytics);
            } catch (error) {
                if (isMounted) toast.error("Failed to load analytics data.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchAnalytics();
        return () => {
            isMounted = false;
        };
    }, []);

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

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        const d = new Date(dateString);
        return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString();
    };

    const pendingOrders = analytics?.statusBreakdown["Pending"] || 0;
    const totalOrders = analytics?.totalOrders || 0;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome Back, {user?.name || "Vendor"}!
                </h1>
                <p className="text-gray-500 mt-1">Here is what's happening with your store today.</p>
            </div>

            {/* সামারি কার্ড */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Sales</p>
                        <p className="text-3xl font-bold text-green-700 mt-2">
                            ৳{loading ? "..." : analytics?.totalRevenue.toFixed(2)}
                        </p>
                    </div>
                    {/* <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl font-bold">
                        💰
                    </div> */}
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Active Products</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                            {loading ? "..." : analytics?.totalProducts}
                        </p>
                    </div>
                    {/* <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl font-bold">
                        🛍️
                    </div> */}
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Orders</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                            {loading ? "..." : totalOrders}
                        </p>
                        <p className="text-xs text-amber-600 font-medium mt-1">{pendingOrders} Pending</p>
                    </div>
                    {/* <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
                        📦
                    </div> */}
                </div>
            </div>

            {/* Status + Payment Breakdown — পাশাপাশি */}
            {!loading && analytics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h2 className="text-sm font-bold text-gray-900 mb-4">Order Status Breakdown</h2>
                        <div className="flex flex-col gap-3">
                            {["Pending", "Processing", "Delivered", "Cancelled"].map((status) => {
                                const count = analytics.statusBreakdown[status] || 0;
                                const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
                                return (
                                    <div key={status}>
                                        <div className="flex justify-between text-xs mb-1 text-gray-600">
                                            <span>{status}</span>
                                            <span>{count}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${statusColors[status]}`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h2 className="text-sm font-bold text-gray-900 mb-4">Payment Status</h2>
                        <div className="flex gap-6">
                            <div>
                                <p className="text-xs text-gray-500">Paid</p>
                                <p className="text-lg font-semibold text-green-700">
                                    {analytics.paymentBreakdown["Paid"] || 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Unpaid</p>
                                <p className="text-lg font-semibold text-yellow-600">
                                    {analytics.paymentBreakdown["Unpaid"] || 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Failed</p>
                                <p className="text-lg font-semibold text-red-600">
                                    {analytics.paymentBreakdown["Failed"] || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                        <p className="text-xs text-gray-500">Latest transactions in your store.</p>
                    </div>
                    <Link
                        href="/dashboard/orders"
                        className="text-xs font-semibold text-orange-600 hover:underline flex items-center gap-1"
                    >
                        View All Orders →
                    </Link>
                </div>

                {loading ? (
                    <p className="text-sm text-gray-500 py-4">Loading recent transactions...</p>
                ) : !analytics || analytics.recentOrders.length === 0 ? (
                    <p className="text-sm text-gray-400 py-4 text-center">No orders recorded yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                    <th className="py-3 px-2">Order ID</th>
                                    <th className="py-3 px-2">Customer</th>
                                    <th className="py-3 px-2">Date</th>
                                    <th className="py-3 px-2">Total</th>
                                    <th className="py-3 px-2">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {analytics.recentOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3.5 px-2 font-mono text-xs font-bold text-gray-900">
                                            #{order._id.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="py-3.5 px-2">
                                            <p className="font-medium text-gray-900">{order.customerName}</p>
                                        </td>
                                        <td className="py-3.5 px-2 text-xs text-gray-500">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="py-3.5 px-2 font-semibold text-gray-900">
                                            ৳{order.totalAmount.toFixed(2)}
                                        </td>
                                        <td className="py-3.5 px-2">
                                            <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border ${getStatusBadge(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}