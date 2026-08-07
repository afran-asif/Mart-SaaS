// src/app/dashboard/orders/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { getAllOrders, updateOrderStatusApi, Order } from "@/services/orderService";

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    // Modal view for order details
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Fetch orders
    const fetchOrders = async () => {
        try {
            const data = await getAllOrders();
            setOrders(data);
        } catch (err: any) {
            toast.error("Failed to load orders. Please refresh.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

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

    // Search and Status Filtering
    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const matchesSearch =
                order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "All" || order.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [orders, searchTerm, statusFilter]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                <p className="text-gray-500 mt-1">Track and manage store purchases.</p>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-full sm:w-1/2 relative">
                    <input
                        type="text"
                        placeholder="Search by Order ID, Customer Name or Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm text-gray-900"
                    />
                    <span className="absolute left-3.5 top-3 text-gray-400">🔍</span>
                </div>

                <div className="w-full sm:w-auto flex items-center gap-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0">
                        Status:
                    </label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-orange-500 transition-colors text-sm text-gray-900"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Loading */}
            {loading && <p className="text-gray-600 font-medium p-4">Loading orders...</p>}

            {/* Orders Table */}
            {!loading && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {filteredOrders.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">
                            No orders found matching your criteria.
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm font-semibold">
                                    <th className="p-4 pl-6">Order ID</th>
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Total</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-gray-700 text-sm">
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 pl-6 font-mono text-xs font-semibold text-gray-900">
                                            #{order._id.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-950">{order.customerName}</div>
                                            <div className="text-xs text-gray-400">{order.customerEmail}</div>
                                        </td>
                                        <td className="p-4 text-xs text-gray-500">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="p-4 font-semibold text-gray-900">
                                            ${order.totalAmount.toFixed(2)}
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                className={`px-3 py-1 text-xs font-semibold rounded-lg border focus:outline-none transition-colors cursor-pointer ${getStatusBadge(
                                                    order.status
                                                )}`}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="text-orange-600 hover:underline font-medium text-xs transition-colors"
                                            >
                                                View Items
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ORDER DETAILS MODAL */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Order #{selectedOrder._id.slice(-6).toUpperCase()}
                                </h2>
                                <p className="text-xs text-gray-500">{selectedOrder.customerName} — {selectedOrder.customerEmail}</p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
                            >
                                ×
                            </button>
                        </div>

                        <div className="border-t border-b border-gray-100 py-3 my-3 space-y-1 text-xs text-gray-600">
                            <p><span className="font-semibold text-gray-800">Address:</span> {selectedOrder.shippingAddress}</p>
                            <p><span className="font-semibold text-gray-800">Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                        </div>

                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Items Ordered</h3>
                        
                        <div className="space-y-3 mb-6">
                            {selectedOrder.items.map((item, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700 shrink-0">
                                            📦
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-900">{item.product?.name || "Product"}</p>
                                            <p className="text-[11px] text-gray-500">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs font-bold text-gray-900">
                                        ${(item.quantity * item.price).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <span className="text-sm font-bold text-gray-700">Grand Total</span>
                            <span className="text-lg font-extrabold text-orange-600">${selectedOrder.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}