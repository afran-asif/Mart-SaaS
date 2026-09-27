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
    const [saving, setSaving] = useState(false);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put("/store/config", {
                facebookPixelId: facebookPixelId.trim(),
                googleAnalyticsId: googleAnalyticsId.trim(),
                tiktokPixelId: tiktokPixelId.trim(),
            });
            if (res.data.proLocked?.length) {
                toast.error(`Pro required: ${res.data.proLocked.join(", ")} not saved. Upgrade from Billing.`);
            } else {
                toast.success("Tracking settings updated.");
            }
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                    Marketing & Tracking {plan !== "pro" && <span className="text-[10px] bg-gray-900 text-white px-1.5 py-0.5 rounded-md align-middle">🔒 Pro</span>}
                </h1>
                <p className="text-gray-500 mt-1 text-sm">
                    Add your ad pixels to track visitors and measure ad performance.
                    {plan !== "pro" && " Upgrade to Pro to enable pixels."}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
                <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Facebook Pixel ID
                    </label>
                    <input
                        type="text"
                        value={facebookPixelId}
                        onChange={(e) => setFacebookPixelId(e.target.value)}
                        disabled={plan !== "pro"}
                        placeholder="e.g. 123456789012345"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 text-sm font-mono outline-none transition-all disabled:bg-gray-50"
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
                        disabled={plan !== "pro"}
                        placeholder="e.g. G-XXXXXXXXXX"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 text-sm font-mono outline-none transition-all disabled:bg-gray-50"
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
                        disabled={plan !== "pro"}
                        placeholder="e.g. CXXXXXXXXXXXXXXXX"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 text-sm font-mono outline-none transition-all disabled:bg-gray-50"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        Found in TikTok Ads Manager → Assets → Events.
                    </p>
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