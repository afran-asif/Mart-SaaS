// src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { getAllOrders, Order } from "@/services/orderService";
import { getAllProducts, Product } from "@/services/productService";

export default function DashboardPage() {
  const { user } = useSelector((state: any) => state.auth);

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchAnalytics = async () => {
      try {
        const [ordersData, productsData] = await Promise.all([
          getAllOrders(),
          getAllProducts(),
        ]);
        if (isMounted) {
          setOrders(ordersData || []);
          setProducts(productsData || []);
        }
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

  const totalRevenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const recentOrders = orders.slice(0, 5);

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome Back, {user?.name || "Vendor"}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Here is what's happening with your store today.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Sales</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ${loading ? "..." : totalRevenue.toFixed(2)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl font-bold">
            💰
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Active Products</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {loading ? "..." : products.length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl font-bold">
            🛍️
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {loading ? "..." : orders.length}
            </p>
            <p className="text-xs text-amber-600 font-medium mt-1">
              {pendingOrders} Pending
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
            📦
          </div>
        </div>
      </div>

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
        ) : recentOrders.length === 0 ? (
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
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-2 font-mono text-xs font-bold text-gray-900">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-2">
                      <p className="font-medium text-gray-900">{order.customerName}</p>
                      <p className="text-[11px] text-gray-400">{order.customerEmail}</p>
                    </td>
                    <td className="py-3.5 px-2 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-2 font-semibold text-gray-900">
                      ${order.totalAmount.toFixed(2)}
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