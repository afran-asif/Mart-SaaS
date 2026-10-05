"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/services/api";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { getCourierBalance } from "@/services/courierService";

export default function CourierSettingsPage() {
    const { t, language } = useTranslation();
    const [steadfastApiKey, setSteadfastApiKey] = useState("");
    const [steadfastSecretKey, setSteadfastSecretKey] = useState("");
    const [courierConnected, setCourierConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [checkingBalance, setCheckingBalance] = useState(false);

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const res = await api.get("/store/config");
                setCourierConnected(!!res.data?.store?.steadfastConnected);
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
        if (!steadfastApiKey.trim() || !steadfastSecretKey.trim()) {
            toast.error(t("dashboard.courierPage.bothRequired"));
            return;
        }
        setSaving(true);
        try {
            const res = await api.put("/store/config", {
                steadfastApiKey: steadfastApiKey.trim(),
                steadfastSecretKey: steadfastSecretKey.trim(),
            });
            setSteadfastApiKey("");
            setSteadfastSecretKey("");
            setCourierConnected(!!res.data?.store?.steadfastConnected);
            toast.success(t("dashboard.courierPage.saved"));
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message || "Failed to save keys.");
        } finally {
            setSaving(false);
        }
    };

    const handleRemove = async () => {
        setSaving(true);
        try {
            await api.put("/store/config", { steadfastApiKey: "", steadfastSecretKey: "" });
            setCourierConnected(false);
            toast.success(t("dashboard.courierPage.removed"));
        } catch (error: any) {
            toast.error(error.message || "Failed to disconnect.");
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        setCheckingBalance(true);
        try {
            const data = await getCourierBalance();
            toast.success(`${t("dashboard.courierPage.balanceOk")} ৳${data.balance}`);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message || "Connection failed.");
        } finally {
            setCheckingBalance(false);
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
                <div className="flex items-center gap-3 mt-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">🚚 {t("dashboard.courierPage.title")}</h1>
                    {courierConnected && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 shrink-0">
                            {t("dashboard.courierPage.connected")}
                        </span>
                    )}
                </div>
                <p className="text-gray-500 mt-1 text-sm">
                    {t("dashboard.courierPage.subtitle")}
                </p>
            </div>

            {/* Key কোথায় পাবেন — step guide */}
            <div className="bg-orange-50/60 border border-orange-100 rounded-2xl p-5 text-sm text-gray-700 space-y-1.5">
                <p className="font-bold text-gray-900">{t("dashboard.courierPage.guideTitle")}</p>
                <p>{t("dashboard.courierPage.step1")}</p>
                <p>{t("dashboard.courierPage.step2")}</p>
                <p>{t("dashboard.courierPage.step3")}</p>
                <p>{t("dashboard.courierPage.step4")}</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
                <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        {t("dashboard.courierPage.apiKey")}
                    </label>
                    <input
                        type="password"
                        value={steadfastApiKey}
                        onChange={(e) => setSteadfastApiKey(e.target.value)}
                        placeholder={courierConnected ? t("dashboard.courierPage.changePlaceholder") : t("dashboard.courierPage.apiPlaceholder")}
                        autoComplete="off"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 text-sm font-mono outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        {t("dashboard.courierPage.secretKey")}
                    </label>
                    <input
                        type="password"
                        value={steadfastSecretKey}
                        onChange={(e) => setSteadfastSecretKey(e.target.value)}
                        placeholder={courierConnected ? t("dashboard.courierPage.changePlaceholder") : t("dashboard.courierPage.secretPlaceholder")}
                        autoComplete="off"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 text-sm font-mono outline-none transition-all"
                    />
                </div>

                <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
                    <div className="flex items-center gap-3">
                        {courierConnected && (
                            <>
                                <button
                                    type="button"
                                    onClick={handleTest}
                                    disabled={checkingBalance}
                                    className="text-xs font-bold text-orange-700 hover:text-orange-800 hover:underline underline-offset-2 disabled:opacity-50"
                                >
                                    {checkingBalance ? t("dashboard.courierPage.checking") : t("dashboard.courierPage.test")}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    disabled={saving}
                                    className="text-xs font-bold text-gray-400 hover:text-red-600 hover:underline underline-offset-2 disabled:opacity-50"
                                >
                                    {t("dashboard.courierPage.disconnect")}
                                </button>
                            </>
                        )}
                    </div>
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
