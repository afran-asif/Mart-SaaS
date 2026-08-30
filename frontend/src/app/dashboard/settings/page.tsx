"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/services/api";
import toast from "react-hot-toast";

interface StoreData {
    id: string;
    storeName: string;
    subdomain: string;
    logo: string | null;
    status: "active" | "suspended";
    useOwnSSLCommerz: boolean;
    sslcommerzStoreId?: string;
}

export default function SettingsPage() {
    const [store, setStore] = useState<StoreData | null>(null);

    const [storeName, setStoreName] = useState("");
    const [logo, setLogo] = useState("");
    const [status, setStatus] = useState<"active" | "suspended">("active");
    const [useOwnSSLCommerz, setUseOwnSSLCommerz] = useState(false);
    const [sslcommerzStoreId, setSslcommerzStoreId] = useState("");
    const [sslcommerzStorePassword, setSslcommerzStorePassword] = useState("");
    const [logoError, setLogoError] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const res = await api.get("/store/config");
                const data = res.data.store;
                setStore(data);
                setStoreName(data.storeName || "");
                setLogo(data.logo || "");
                setStatus(data.status || "active");
                setUseOwnSSLCommerz(data.useOwnSSLCommerz || false);
                setSslcommerzStoreId(data.sslcommerzStoreId || "");
            } catch (error: any) {
                toast.error(error.message || "Failed to load store settings.");
            } finally {
                setLoading(false);
            }
        };
        fetchStore();
    }, []);

    const handleCopySubdomain = () => {
        if (!store) return;
        navigator.clipboard.writeText(`https://${store.subdomain}.vendoo.shop`);
        setCopied(true);
        toast.success("Store URL copied.");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload: any = {
                storeName,
                logo: logo.trim() ? logo.trim() : null,
                status,
                useOwnSSLCommerz,
            };

            if (useOwnSSLCommerz) {
                if (sslcommerzStoreId) payload.sslcommerzStoreId = sslcommerzStoreId.trim();
                if (sslcommerzStorePassword) payload.sslcommerzStorePassword = sslcommerzStorePassword.trim();
            }

            const res = await api.put("/store/config", payload);
            setStore(res.data.store);
            setSslcommerzStorePassword("");
            toast.success("Settings updated successfully.");
        } catch (error: any) {
            toast.error(error.message || "Failed to update settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Loading store settings...</p>
            </div>
        );
    }

    if (!store) {
        return (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center max-w-md mx-auto">
                <h3 className="text-base font-bold text-gray-900">Store not found</h3>
                <p className="text-sm text-gray-500 mt-1">Unable to locate your store profile.</p>
            </div>
        );
    }

    const storeUrl = `http://${store.subdomain}.localhost:3000`;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
                    <p className="text-gray-500 mt-1">
                        Manage your storefront identity and payment routing.
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm">
                    <span className="px-2.5 font-mono text-xs font-semibold text-gray-700 truncate max-w-[180px]">
                        {store.subdomain}.vendoo.shop
                    </span>
                    <button
                        type="button"
                        onClick={handleCopySubdomain}
                        className="px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-orange-600 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        {copied ? "Copied" : "Copy"}
                    </button>
                    {/* <a
                        href={storeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                        Visit Store
                    </a> */}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* --- বাম কলাম: ফর্ম ফিল্ড --- */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Store Identity card */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
                        <h2 className="text-sm font-bold text-gray-900">Store Identity</h2>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                Store Name
                            </label>
                            <input
                                type="text"
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                                required
                                placeholder="e.g. Apex Fashion House"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 text-sm font-medium outline-none transition-all"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Shown across your storefront and order invoices.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                Logo Image URL
                            </label>
                            <input
                                type="url"
                                value={logo}
                                onChange={(e) => {
                                    setLogo(e.target.value);
                                    setLogoError(false);
                                }}
                                placeholder="https://res.cloudinary.com/..."
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 text-sm font-mono outline-none transition-all"
                            />
                            <p className="text-xs text-gray-400 mt-1">Recommended: 200×200px, transparent PNG.</p>
                        </div>

                        {/* Store status — এখন editable */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                Store Status
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStatus("active")}
                                    className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                                        status === "active"
                                            ? "border-green-500 bg-green-50/50 ring-2 ring-green-500/15"
                                            : "border-gray-200 hover:border-gray-300 bg-white"
                                    }`}
                                >
                                    <div
                                        className={`w-4 h-4 mt-0.5 rounded-full border flex items-center justify-center shrink-0 ${
                                            status === "active" ? "border-green-600 bg-green-600" : "border-gray-300"
                                        }`}
                                    >
                                        {status === "active" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">Active & Open</p>
                                        <p className="text-[11px] text-gray-500 mt-0.5">
                                            Customers can browse & order
                                        </p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStatus("suspended")}
                                    className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                                        status === "suspended"
                                            ? "border-red-500 bg-red-50/50 ring-2 ring-red-500/15"
                                            : "border-gray-200 hover:border-gray-300 bg-white"
                                    }`}
                                >
                                    <div
                                        className={`w-4 h-4 mt-0.5 rounded-full border flex items-center justify-center shrink-0 ${
                                            status === "suspended" ? "border-red-600 bg-red-600" : "border-gray-300"
                                        }`}
                                    >
                                        {status === "suspended" && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">Suspended</p>
                                        <p className="text-[11px] text-gray-500 mt-0.5">
                                            Storefront paused temporarily
                                        </p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Payment routing card */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">Payment Routing</h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Choose which SSLCommerz account collects your customer payments.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setUseOwnSSLCommerz(false)}
                                className={`text-left p-4 rounded-xl border-2 transition-all ${
                                    !useOwnSSLCommerz
                                        ? "border-orange-500 bg-orange-50/40"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                                        Default
                                    </span>
                                    <span
                                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                            !useOwnSSLCommerz ? "border-orange-600 bg-orange-600" : "border-gray-300"
                                        }`}
                                    >
                                        {!useOwnSSLCommerz && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-gray-900">MART-SaaS Gateway</p>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    No setup needed. Payments settle through the platform account.
                                </p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setUseOwnSSLCommerz(true)}
                                className={`text-left p-4 rounded-xl border-2 transition-all ${
                                    useOwnSSLCommerz
                                        ? "border-orange-500 bg-orange-50/40"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                                        Direct
                                    </span>
                                    <span
                                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                            useOwnSSLCommerz ? "border-orange-600 bg-orange-600" : "border-gray-300"
                                        }`}
                                    >
                                        {useOwnSSLCommerz && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-gray-900">Your Own SSLCommerz</p>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    Funds settle directly into your merchant account.
                                </p>
                            </button>
                        </div>

                        {/* Credentials — smooth expand */}
                        <div
                            className={`grid transition-all duration-300 ease-in-out ${
                                useOwnSSLCommerz ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                            }`}
                        >
                            <div className="overflow-hidden">
                                <div className="pt-1 space-y-4 border-t border-gray-100 mt-1">
                                    <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 mt-4">
                                        <span className="mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        <p className="leading-relaxed">
                                            Requires an approved SSLCommerz merchant account. Your password is
                                            encrypted (AES-256) before it's saved — never stored or shown as plain
                                            text.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                                Store ID
                                            </label>
                                            <input
                                                type="text"
                                                value={sslcommerzStoreId}
                                                onChange={(e) => setSslcommerzStoreId(e.target.value)}
                                                required={useOwnSSLCommerz}
                                                placeholder="e.g. yourstorelive01"
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 text-sm font-mono outline-none transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                                Store Password
                                            </label>
                                            <input
                                                type="password"
                                                value={sslcommerzStorePassword}
                                                onChange={(e) => setSslcommerzStorePassword(e.target.value)}
                                                placeholder={
                                                    store.sslcommerzStoreId
                                                        ? "Leave blank to keep existing"
                                                        : "Enter Store Password"
                                                }
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 text-sm font-mono outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Save bar */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                        <p className="text-xs text-gray-500">Changes apply immediately after saving.</p>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
                        >
                            {saving && (
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>

                {/* --- ডান কলাম: Live Store Preview (sticky) --- */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Live Preview
                            </h3>
                            <span className="text-[10px] bg-orange-50 text-orange-600 font-semibold px-2 py-0.5 rounded-md">
                                Auto-updates
                            </span>
                        </div>

                        <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50/60 text-center space-y-4">
                            {/* Logo / initial */}
                            <div className="relative w-20 h-20 mx-auto rounded-2xl overflow-hidden border-2 border-white shadow-sm bg-white flex items-center justify-center">
                                {logo.trim() && !logoError ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={logo}
                                        alt={storeName || "Store logo"}
                                        className="w-full h-full object-contain"
                                        onError={() => setLogoError(true)}
                                    />
                                ) : (
                                    <span className="text-2xl font-bold text-orange-600">
                                        {storeName ? storeName.charAt(0).toUpperCase() : "S"}
                                    </span>
                                )}
                            </div>

                            <div>
                                <h4 className="text-base font-bold text-gray-900 truncate">
                                    {storeName || "Your Store Name"}
                                </h4>
                                <p className="text-xs font-mono text-gray-400 mt-0.5">
                                    {store.subdomain}.vendoo.shop
                                </p>
                            </div>

                            <div className="pt-3 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500">
                                <span
                                    className={`w-2 h-2 rounded-full ${
                                        status === "active" ? "bg-green-500" : "bg-red-500"
                                    }`}
                                />
                                <span>{status === "active" ? "Storefront Online" : "Temporarily Offline"}</span>
                            </div>

                            <div className="pt-1">
                                <span
                                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                                        useOwnSSLCommerz
                                            ? "bg-blue-50 text-blue-700"
                                            : "bg-orange-50 text-orange-700"
                                    }`}
                                >
                                    {useOwnSSLCommerz ? "Direct payment routing" : "Platform payment routing"}
                                </span>
                            </div>
                        </div>

                        <a
                            href={storeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-center py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold transition-colors"
                        >
                            Visit Store ↗
                        </a>
                    </div>
                </div>
            </form>
        </div>
    );
}
