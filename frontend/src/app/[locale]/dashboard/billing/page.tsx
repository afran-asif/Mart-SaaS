"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { useSubscription } from "@/hooks/useSubscription";
import { requestSubscription } from "@/services/subscriptionService";

const PRO_FEATURES = [
    "Unlimited products & orders",
    "Custom domain",
    "All 9 store themes",
    "Coupons & discounts",
    "Facebook / Google / TikTok pixels",
    "Own SSLCommerz gateway",
    "0% transaction fee",
];

export default function LocalizedBillingPage() {
    const { t } = useTranslation();
    const { sub, loading, refresh } = useSubscription();
    const [trxId, setTrxId] = useState("");
    const [senderNumber, setSenderNumber] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!sub?.bkashNumber) return;
        navigator.clipboard.writeText(sub.bkashNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trxId.trim() || !senderNumber.trim()) {
            toast.error(t("dashboard.billingPage.fillAll"));
            return;
        }
        setSubmitting(true);
        try {
            await requestSubscription(trxId.trim(), senderNumber.trim());
            toast.success(t("dashboard.billingPage.requestSent"));
            setTrxId("");
            setSenderNumber("");
            refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to submit request.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
                <p className="text-sm text-gray-500">{t("dashboard.billingPage.loading")}</p>
            </div>
        );
    }

    const isPro = sub?.plan === "pro";
    const usage = sub?.usage;

    const meter = (used: number, max: number | null | undefined, label: string) => (
        <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-gray-700">{label}</span>
                <span className="font-mono text-gray-500">
                    {used}/{max === null || max === undefined ? "∞" : max}
                </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${
                        max && used >= max ? "bg-red-500" : "bg-orange-500"
                    }`}
                    style={{ width: !max ? "8%" : `${Math.min(100, (used / max) * 100)}%` }}
                />
            </div>
        </div>
    );

    return (
        <div className="space-y-6 sm:space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("dashboard.billingPage.title")}</h1>
                <p className="text-gray-500 mt-1 text-sm">{t("dashboard.billingPage.subtitle")}</p>
            </div>

            {/* Current plan */}
            <div
                className={`rounded-2xl p-6 border shadow-sm ${
                    isPro ? "bg-gradient-to-br from-orange-600 to-orange-700 border-orange-700 text-white" : "bg-white border-gray-100"
                }`}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <p className={`text-xs font-semibold uppercase tracking-wider ${isPro ? "text-orange-200" : "text-gray-400"}`}>
                            {t("dashboard.billingPage.currentPlan")}
                        </p>
                        <h2 className="text-2xl font-extrabold mt-1">
                            {isPro ? "Pro" : "Free"}
                            {sub?.isTrial && (
                                <span className="ml-2 text-xs font-semibold bg-white/20 px-2 py-1 rounded-md align-middle">
                                    {t("dashboard.billingPage.trial")}
                                </span>
                            )}
                        </h2>
                        {sub?.planExpiresAt && (
                            <p className={`text-xs mt-1 ${isPro ? "text-orange-100" : "text-gray-500"}`}>
                                {t("dashboard.billingPage.validTill")}: {new Date(sub.planExpiresAt).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                    {!isPro && sub && (
                        <div className="text-left sm:text-right">
                            <p className={`text-xs ${"text-gray-500"}`}>{t("dashboard.billingPage.proPriceLabel")}</p>
                            <p className="text-2xl font-extrabold">
                                ৳{sub.proPrice}
                                <span className="text-sm font-medium opacity-70">/{t("dashboard.billingPage.perMonth")}</span>
                            </p>
                        </div>
                    )}
                </div>

                {usage && (
                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 ${isPro ? "[&_span]:!text-orange-100 [&_.bg-gray-100]:!bg-white/20" : ""}`}>
                        {meter(usage.products, usage.maxProducts, t("dashboard.billingPage.products"))}
                        {meter(usage.ordersThisMonth, usage.maxOrdersPerMonth, t("dashboard.billingPage.ordersMonth"))}
                    </div>
                )}
            </div>

            {/* Upgrade / pending / active states */}
            {!isPro && !sub?.pendingRequest && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900">{t("dashboard.billingPage.whyPro")}</h3>
                        <ul className="mt-3 space-y-2">
                            {PRO_FEATURES.map((f) => (
                                <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                                    <span className="text-green-600 font-bold">✓</span> {f}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900">{t("dashboard.billingPage.payTitle")}</h3>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{t("dashboard.billingPage.payDesc")}</p>

                        {sub?.bkashNumber ? (
                            <div className="flex items-center gap-2 mt-3 bg-pink-50 border border-pink-200 rounded-xl px-4 py-3">
                                <span className="font-mono font-bold text-pink-700 flex-1">{sub.bkashNumber}</span>
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="text-xs font-semibold text-pink-700 hover:text-pink-900"
                                >
                                    {copied ? t("dashboard.billingPage.copied") : t("dashboard.billingPage.copy")}
                                </button>
                            </div>
                        ) : null}

                        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                    {t("dashboard.billingPage.trxId")}
                                </label>
                                <input
                                    type="text"
                                    value={trxId}
                                    onChange={(e) => setTrxId(e.target.value)}
                                    placeholder="e.g. 9HXK2LMN4P"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 text-sm font-mono outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                    {t("dashboard.billingPage.senderNumber")}
                                </label>
                                <input
                                    type="text"
                                    value={senderNumber}
                                    onChange={(e) => setSenderNumber(e.target.value)}
                                    placeholder="01XXXXXXXXX"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 text-sm font-mono outline-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold transition-colors disabled:opacity-60"
                            >
                                {submitting ? "..." : t("dashboard.billingPage.submitRequest")}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {!isPro && sub?.pendingRequest && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                    <p className="text-sm font-bold text-amber-900">{t("dashboard.billingPage.pendingTitle")}</p>
                    <p className="text-xs text-amber-800 mt-1">
                        {t("dashboard.billingPage.pendingDesc")} ({sub.pendingRequest.trxId})
                    </p>
                </div>
            )}

            {/* History */}
            {sub && sub.history.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">{t("dashboard.billingPage.history")}</h3>
                    <div className="divide-y divide-gray-100">
                        {sub.history.map((h) => (
                            <div key={h.id} className="py-2.5 flex items-center justify-between text-sm">
                                <div>
                                    <span className="font-semibold text-gray-800 capitalize">{h.plan}</span>
                                    <span className={`ml-2 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                                        h.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                                    }`}>
                                        {h.status}
                                    </span>
                                </div>
                                <div className="text-right text-xs text-gray-500">
                                    <p className="font-mono font-semibold text-gray-700">৳{h.amount}</p>
                                    <p>{new Date(h.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}