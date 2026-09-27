"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/services/api";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";

export default function PaymentsSettingsPage() {
    const { t, language } = useTranslation();
    const [useOwnSSLCommerz, setUseOwnSSLCommerz] = useState(false);
    const [sslcommerzStoreId, setSslcommerzStoreId] = useState("");
    const [sslcommerzStorePassword, setSslcommerzStorePassword] = useState("");
    const [hasGateway, setHasGateway] = useState(false);
    const [plan, setPlan] = useState<"free" | "pro">("free");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const res = await api.get("/store/config");
                const data = res.data.store;
                setUseOwnSSLCommerz(data.useOwnSSLCommerz || false);
                setSslcommerzStoreId(data.sslcommerzStoreId || "");
                setHasGateway(!!data.sslcommerzStoreId);
                setPlan(data.plan || "free");
            } catch (error: any) {
                toast.error(error.message || "Failed to load settings.");
            } finally {
                setLoading(false);
            }
        };
        fetchStore();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload: any = { useOwnSSLCommerz };
            if (useOwnSSLCommerz) {
                if (sslcommerzStoreId) payload.sslcommerzStoreId = sslcommerzStoreId.trim();
                if (sslcommerzStorePassword) payload.sslcommerzStorePassword = sslcommerzStorePassword.trim();
            }
            const res = await api.put("/store/config", payload);
            setHasGateway(!!res.data.store.sslcommerzStoreId);
            setSslcommerzStorePassword("");
            toast.success("Payment settings updated.");
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

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <Link href={`/${language}/dashboard/settings`} className="text-xs text-gray-400 hover:text-gray-600">
                    ← {t("dashboard.storeSettings")}
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{t("dashboard.settingsPage.paymentRouting")}</h1>
                <p className="text-gray-500 mt-1 text-sm">
                    {t("dashboard.settingsPage.paymentRoutingDesc")}
                    {plan !== "pro" && " Own gateway is Pro-only."}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
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
                        <p className="mt-2 inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-500">
                            ⚠️ Currently OFF
                        </p>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            if (plan !== "pro") {
                                toast.error("Own gateway is Pro-only. Upgrade from Billing.");
                                return;
                            }
                            setUseOwnSSLCommerz(true);
                        }}
                        className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                            useOwnSSLCommerz
                                ? "border-orange-500 bg-orange-50/40"
                                : "border-gray-200 hover:border-gray-300"
                        } ${plan !== "pro" ? "opacity-50 grayscale cursor-not-allowed" : ""}`}
                    >
                        {plan !== "pro" && (
                            <span className="absolute top-2 right-2 text-[10px] font-bold bg-gray-900 text-white px-1.5 py-0.5 rounded-md">
                                🔒 Pro
                            </span>
                        )}
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
                        {plan !== "pro" && (
                            <a
                                href={`/${language}/dashboard/billing`}
                                onClick={(e) => e.stopPropagation()}
                                className="mt-2 inline-block text-[11px] font-bold text-orange-600 hover:underline"
                            >
                                Upgrade to Pro →
                            </a>
                        )}
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
                                            hasGateway
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

                <div className="flex justify-end pt-1">
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
            </form>
        </div>
    );
}