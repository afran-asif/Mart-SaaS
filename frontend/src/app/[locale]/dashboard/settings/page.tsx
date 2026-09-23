"use client";

import React, { useState, useEffect, useRef } from "react";
import { api } from "@/services/api";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface StoreData {
    id: string;
    storeName: string;
    subdomain: string;
    logo: string | null;
    status: "active" | "suspended";
    useOwnSSLCommerz: boolean;
    sslcommerzStoreId?: string;
    facebookPixelId?: string;
    googleAnalyticsId?: string;
    tiktokPixelId?: string;
}

export default function LocalizedSettingsPage() {
    const { t } = useTranslation();
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
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const [facebookPixelId, setFacebookPixelId] = useState("");
    const [googleAnalyticsId, setGoogleAnalyticsId] = useState("");
    const [tiktokPixelId, setTiktokPixelId] = useState("");

    const baseDomain = process.env.NEXT_PUBLIC_FRONTEND_BASE_DOMAIN || "localhost:3000";
    const protocol = process.env.NEXT_PUBLIC_FRONTEND_PROTOCOL || "http";

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
                setFacebookPixelId(data.facebookPixelId || "");
                setGoogleAnalyticsId(data.googleAnalyticsId || "");
                setTiktokPixelId(data.tiktokPixelId || "");
            } catch (error: any) {
                toast.error(error.message || "Failed to load store settings.");
            } finally {
                setLoading(false);
            }
        };
        fetchStore();
    }, []);

    const handleCopySubdomain = () => {        if (!store) return;
        navigator.clipboard.writeText(`${protocol}://${store.subdomain}.${baseDomain}`);
        setCopied(true);
        toast.success("Store URL copied.");
        setTimeout(() => setCopied(false), 2000);
    };

    // Logo file upload — Cloudinary te direct upload
    const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be under 5MB.");
            return;
        }

        setUploadingLogo(true);
        try {
            const formData = new FormData();
            formData.append("logo", file);
            const res = await api.post("/store/logo", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setLogo(res.data.logo || "");
            setLogoError(false);
            toast.success("Logo uploaded successfully.");
        } catch (error: any) {
            toast.error(error.message || "Logo upload failed.");
        } finally {
            setUploadingLogo(false);
            if (logoInputRef.current) logoInputRef.current.value = "";
        }
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
                facebookPixelId: facebookPixelId.trim(),
                googleAnalyticsId: googleAnalyticsId.trim(),
                tiktokPixelId: tiktokPixelId.trim(),
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
                <p className="text-sm text-gray-500">{t("dashboard.settingsPage.loading")}</p>
            </div>
        );
    }

    if (!store) {
        return (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center max-w-md mx-auto">
                <h3 className="text-base font-bold text-gray-900">{t("dashboard.settingsPage.storeNotFound")}</h3>
                <p className="text-sm text-gray-500 mt-1">{t("dashboard.settingsPage.storeNotFoundDesc")}</p>
            </div>
        );
    }

    const storeUrl = `${protocol}://${store.subdomain}.${baseDomain}`;
    const displayDomain = `${store.subdomain}.${baseDomain}`;

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("dashboard.settingsPage.title")}</h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        {t("dashboard.settingsPage.subtitle")}
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm self-start sm:self-auto">
                    <span className="px-2.5 font-mono text-xs font-semibold text-gray-700 truncate max-w-[160px] sm:max-w-[180px]">
                        {displayDomain}
                    </span>
                    <button
                        type="button"
                        onClick={handleCopySubdomain}
                        className="px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-orange-600 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                        {copied ? t("dashboard.settingsPage.copied") : t("dashboard.settingsPage.copy")}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
                {/* --- Left Column: Form Fields --- */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Store Identity card */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
                        <h2 className="text-sm font-bold text-gray-900">{t("dashboard.settingsPage.storeIdentity")}</h2>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                {t("dashboard.settingsPage.storeName")}
                            </label>
                            <input
                                type="text"
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                                required
                                placeholder={t("dashboard.settingsPage.storeNamePlaceholder")}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 text-sm font-medium outline-none transition-all"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                {t("dashboard.settingsPage.storeNameDesc")}
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                {t("dashboard.settingsPage.logoUrl")}
                            </label>
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                                    {logo.trim() && !logoError ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={logo}
                                            alt="Store logo"
                                            className="w-full h-full object-contain"
                                            onError={() => setLogoError(true)}
                                        />
                                    ) : (
                                        <span className="text-xl font-bold text-gray-300">🏪</span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => logoInputRef.current?.click()}
                                        disabled={uploadingLogo}
                                        className="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {uploadingLogo ? "Uploading..." : logo.trim() ? "Change logo" : "Upload logo"}
                                    </button>
                                    {logo.trim() && !uploadingLogo && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setLogo("");
                                                setLogoError(false);
                                            }}
                                            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:border-red-300 hover:text-red-600 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <input
                                    ref={logoInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleLogoFileChange}
                                />
                            </div>
                            <input
                                type="url"
                                value={logo}
                                onChange={(e) => {
                                    setLogo(e.target.value);
                                    setLogoError(false);
                                }}
                                placeholder="https://res.cloudinary.com/..."
                                className="mt-2 w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 text-xs font-mono text-gray-500 outline-none transition-all"
                            />
                            <p className="text-xs text-gray-400 mt-1">{t("dashboard.settingsPage.logoDesc")}</p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                {t("dashboard.settingsPage.storeStatus")}
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
                                        <p className="text-xs font-bold text-gray-900">{t("dashboard.settingsPage.activeOpen")}</p>
                                        <p className="text-[11px] text-gray-500 mt-0.5">
                                            {t("dashboard.settingsPage.activeOpenDesc")}
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
                                        <p className="text-xs font-bold text-gray-900">{t("dashboard.settingsPage.suspended")}</p>
                                        <p className="text-[11px] text-gray-500 mt-0.5">
                                            {t("dashboard.settingsPage.suspendedDesc")}
                                        </p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Payment Routing card */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">{t("dashboard.settingsPage.paymentRouting")}</h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {t("dashboard.settingsPage.paymentRoutingDesc")}
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
                                <p className="text-sm font-bold text-gray-900">{t("dashboard.settingsPage.defaultGateway")}</p>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    {t("dashboard.settingsPage.defaultGatewayDesc")}
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
                                <p className="text-sm font-bold text-gray-900">{t("dashboard.settingsPage.ownSSLCommerz")}</p>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    {t("dashboard.settingsPage.ownSSLCommerzDesc")}
                                </p>
                            </button>
                        </div>

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
                                            {t("dashboard.settingsPage.sslNote")}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                                {t("dashboard.settingsPage.storeId")}
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
                                                {t("dashboard.settingsPage.storePassword")}
                                            </label>
                                            <input
                                                type="password"
                                                value={sslcommerzStorePassword}
                                                onChange={(e) => setSslcommerzStorePassword(e.target.value)}
                                                placeholder={
                                                    store.sslcommerzStoreId
                                                        ? t("dashboard.settingsPage.storePasswordPlaceholder")
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

                    {/* Marketing & Tracking card */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">Marketing & Tracking</h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Add your ad pixels to track visitors and measure ad performance.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                Facebook Pixel ID
                            </label>
                            <input
                                type="text"
                                value={facebookPixelId}
                                onChange={(e) => setFacebookPixelId(e.target.value)}
                                placeholder="e.g. 123456789012345"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 text-sm font-mono outline-none transition-all"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Found in Facebook Events Manager → Data Sources → your Pixel.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                Google Analytics Measurement ID
                            </label>
                            <input
                                type="text"
                                value={googleAnalyticsId}
                                onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                                placeholder="e.g. G-XXXXXXXXXX"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 text-sm font-mono outline-none transition-all"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Found in Google Analytics → Admin → Data Streams.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                TikTok Pixel ID
                            </label>
                            <input
                                type="text"
                                value={tiktokPixelId}
                                onChange={(e) => setTiktokPixelId(e.target.value)}
                                placeholder="e.g. CXXXXXXXXXXXXXXXX"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 text-sm font-mono outline-none transition-all"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Found in TikTok Ads Manager → Assets → Events.
                            </p>
                        </div>
                    </div>

                    {/* Save bar */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                        <p className="text-xs text-gray-500">{t("dashboard.settingsPage.saveBar")}</p>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
                        >
                            {saving && (
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                            {saving ? t("dashboard.settingsPage.savingButton") : t("dashboard.settingsPage.saveButton")}
                        </button>
                    </div>
                </div>

                {/* --- Right Column: Live Store Preview (sticky) --- */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                {t("dashboard.settingsPage.livePreview")}
                            </h3>
                            <span className="text-[10px] bg-orange-50 text-orange-600 font-semibold px-2 py-0.5 rounded-md">
                                {t("dashboard.settingsPage.autoUpdates")}
                            </span>
                        </div>

                        <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50/60 text-center space-y-4">
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
                                    {displayDomain}
                                </p>
                            </div>

                            <div className="pt-3 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500">
                                <span
                                    className={`w-2 h-2 rounded-full ${
                                        status === "active" ? "bg-green-500" : "bg-red-500"
                                    }`}
                                />
                                <span>{status === "active" ? t("dashboard.settingsPage.storefrontOnline") : t("dashboard.settingsPage.storefrontOffline")}</span>
                            </div>

                            <div className="pt-1">
                                <span
                                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                                        useOwnSSLCommerz
                                            ? "bg-blue-50 text-blue-700"
                                            : "bg-orange-50 text-orange-700"
                                    }`}
                                >
                                    {useOwnSSLCommerz ? t("dashboard.settingsPage.directRouting") : t("dashboard.settingsPage.platformRouting")}
                                </span>
                            </div>
                        </div>

                        <a
                            href={storeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-center py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold transition-colors"
                        >
                            {t("dashboard.settingsPage.visitStore")}
                        </a>
                    </div>
                </div>
            </form>
        </div>
    );
}
