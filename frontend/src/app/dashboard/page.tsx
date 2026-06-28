"use client";

import React from "react";
import { useSelector } from "react-redux";

export default function DashboardPage() {
    const { user } = useSelector((state: any) => state.auth);

    return (
        <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back, {user?.name || "Vendor"}! </h1>
            <p className="text-gray-500 mt-1">Here is what's happening with your store today.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-sm font-medium text-gray-500">Total Sales</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">$0.00</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-sm font-medium text-gray-500">Active Products</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
        </div>
        </div>
    );
}