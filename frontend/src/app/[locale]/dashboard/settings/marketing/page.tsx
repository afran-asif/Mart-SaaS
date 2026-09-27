"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/services/api";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";

export default function MarketingSettingsPage() {
    const { t, language } = useTranslation();
    const [facebookPixelId, setFacebookPixelId] = useState("");
    const [googleAnalyticsId, setGoogleAnalyticsId] = useState("");
    const [tiktokPixelId, setTiktokPixelId] = useState("");
    const [plan, setPlan] = useState<"free" | "pro">("free");
    const [loading, setLoading] = useState(true);
    const [savingField, setSavingField] = useState<string | null>(null);

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const res = await api.get("/store/config");
                const data = res.data.store;
                setFacebookPixelId(data.facebookPixelId || "");
                setGoogleAnalyticsId(data.googleAnalyticsId || "");
                setTiktokPixelId(data.tiktokPixelId || "");
                setPlan(data.plan || "free");
            } catch (error: any) {
                toast.error(error.message || "Failed to load settings.");
            } finally {
                setLoading(false);
            }
        };
        fetchStore();
    }, []);

    const handleSavePixel = async (field: "facebookPixelId" | "googleAnalyticsId" | "tiktokPixelId", value: string) => {
        setSavingField(field);
        try {
            const res = await api.put("/store/config", { [field]: value.trim() });
            if (res.data.proLocked?.length) {
                toast.error(`Pro required: ${res.data.proLocked.join(", ")} not saved. Upgrade from Billing.`);
            } else {
                toast.success("Saved.");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to save.");
        } finally {
            setSavingField(null);
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                    Marketing & Tracking {plan !== "pro" && <span className="text-[10px] bg-gray-900 text-white px-1.5 py-0.5 rounded-md align-middle">🔒 Pro</span>}
                </h1>
                <p className="text-gray-500 mt-1 text-sm">
                    Add your ad pixels to track visitors and measure ad performance.
                    {plan !== "pro" && " Upgrade to Pro to enable pixels."}
                </p>
            </div>

            {plan !== "pro" && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <p className="text-sm text-gray-700 flex-1">🔒 Pixels are a Pro feature. Upgrade to track your ads.</p>
                    <a href={`/${language}/dashboard/billing`} className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold whitespace-nowrap transition-colors">
                        Upgrade to Pro →
                    </a>
                </div>
            )}

            <div className="space-y-4">
                {/* Facebook — brand blue */}
                <div className={`rounded-2xl p-6 border border-blue-200 bg-gradient-to-br from-[#F0F6FF] to-white shadow-sm space-y-4 ${plan !== "pro" ? "opacity-60" : ""}`}>
                <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#1877F2] uppercase tracking-wider mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#1877F2] text-white text-[11px] font-extrabold flex items-center justify-center">f</span>
                        Facebook Pixel ID
                        <a
                            href="https://business.facebook.com/events_manager2"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto text-[11px] font-semibold normal-case tracking-normal text-blue-600 hover:underline"
                        >
                            Test events →
                        </a>
                    </label>
<div className="relative">
                            <input
                                type="text"
                                value={facebookPixelId}
                                onChange={(e) => setFacebookPixelId(e.target.value)}
                                disabled={plan !== "pro"}
                                placeholder="e.g. 123456789012345"
                                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 text-sm font-mono outline-none transition-all disabled:bg-gray-50"
                            />
                            {/* FB dot */}
                            <span className={`absolute right-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full shadow-sm ${facebookPixelId.trim() ? "bg-green-500" : "bg-gray-300"}`} />
                            </div>
<p className="text-xs text-gray-400 mt-1">
                                Found in Facebook Events Manager → Data Sources → your Pixel.
                            </p>
                            <div className="flex justify-end pt-1">
                                <button
                                    type="button"
                                    onClick={() => handleSavePixel("facebookPixelId", facebookPixelId)}
                                    disabled={savingField !== null}
                                    className="px-5 py-2 rounded-xl bg-[#1877F2] hover:bg-[#1664d9] text-white text-xs font-bold transition-colors disabled:opacity-60 flex items-center gap-2"
                                >
                                    {savingField === "facebookPixelId" && (
                                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    )}
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Google — G colors */}
                    <div className={`rounded-2xl p-6 border border-gray-200 bg-white shadow-sm space-y-4 ${plan !== "pro" ? "opacity-60" : ""}`}>
                <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        <span className="flex items-center gap-[3px]">
                            <span className="w-2 h-2 rounded-full bg-[#4285F4]" />
                            <span className="w-2 h-2 rounded-full bg-[#EA4335]" />
                            <span className="w-2 h-2 rounded-full bg-[#FBBC05]" />
                            <span className="w-2 h-2 rounded-full bg-[#34A853]" />
                        </span>
                        Google Analytics Measurement ID
                        <a
                            href="https://analytics.google.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto text-[11px] font-semibold normal-case tracking-normal text-blue-600 hover:underline"
                        >
                            Realtime report →
                        </a>
                    </label>
<div className="relative">
                            <input
                                type="text"
                                value={googleAnalyticsId}
                                onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                                disabled={plan !== "pro"}
                                placeholder="e.g. G-XXXXXXXXXX"
                                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 text-sm font-mono outline-none transition-all disabled:bg-gray-50"
                            />
                            {/* GA dot */}
                            <span className={`absolute right-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full shadow-sm ${googleAnalyticsId.trim() ? "bg-green-500" : "bg-gray-300"}`} />
                            </div>
<p className="text-xs text-gray-400 mt-1">
                                Found in Google Analytics → Admin → Data Streams.
                            </p>
                            <div className="flex justify-end pt-1">
                                <button
                                    type="button"
                                    onClick={() => handleSavePixel("googleAnalyticsId", googleAnalyticsId)}
                                    disabled={savingField !== null}
                                    className="px-5 py-2 rounded-xl bg-[#1a73e8] hover:bg-[#1765cc] text-white text-xs font-bold transition-colors disabled:opacity-60 flex items-center gap-2"
                                >
                                    {savingField === "googleAnalyticsId" && (
                                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    )}
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* TikTok — black + neon */}
                    <div className={`rounded-2xl p-6 border border-gray-800 bg-[#010101] shadow-sm space-y-4 ${plan !== "pro" ? "opacity-60" : ""}`}>
                <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                        <span className="font-extrabold text-sm tracking-tight">
                            <span className="text-[#25F4EE]">d</span><span className="text-white">T</span><span className="text-[#FE2C55]">.</span>
                        </span>
                        TikTok Pixel ID
                        <a
                            href="https://ads.tiktok.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto text-[11px] font-semibold normal-case tracking-normal text-[#25F4EE] hover:underline"
                        >
                            Test events →
                        </a>
                    </label>
                    <div className="relative">
                    <input
                        type="text"
                        value={tiktokPixelId}
                        onChange={(e) => setTiktokPixelId(e.target.value)}
                        disabled={plan !== "pro"}
                        placeholder="e.g. CXXXXXXXXXXXXXXXX"
                        className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-700 bg-white focus:border-[#FE2C55] focus:ring-2 focus:ring-[#FE2C55]/20 text-sm font-mono outline-none transition-all disabled:bg-gray-100 text-gray-900"
                    />
                    {/* TikTok dot */}
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full shadow-sm ${tiktokPixelId.trim() ? "bg-green-500" : "bg-gray-300"}`} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                        Found in TikTok Ads Manager → Assets → Events.
                    </p>
                            <div className="flex justify-end pt-1">
                                <button
                                    type="button"
                                    onClick={() => handleSavePixel("tiktokPixelId", tiktokPixelId)}
                                    disabled={savingField !== null}
                                    className="px-5 py-2 rounded-xl bg-[#FE2C55] hover:bg-[#d9284d] text-white text-xs font-bold transition-colors disabled:opacity-60 flex items-center gap-2"
                                >
                                    {savingField === "tiktokPixelId" && (
                                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    )}
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    );
}