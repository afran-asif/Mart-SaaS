"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/services/api";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { useDispatch } from "react-redux";
import { updateStoreInfo } from "@/redux/authSlice";

const SUBDOMAIN_CHANGE_LIMIT = 3;

export default function DomainSettingsPage() {
    const { t, language } = useTranslation();
    const dispatch = useDispatch();
    const [storeName, setStoreName] = useState("");
    const [subdomain, setSubdomain] = useState("");
    const [savedSubdomain, setSavedSubdomain] = useState("");
    const [subdomainChanges, setSubdomainChanges] = useState(0);
    const [editingSubdomain, setEditingSubdomain] = useState(false);
    const [savingSubdomain, setSavingSubdomain] = useState(false);
    const [customDomain, setCustomDomain] = useState("");
    const [customDomainStatus, setCustomDomainStatus] = useState<
        "none" | "pending" | "verified" | "failed"
    >("none");
    const [verificationCode, setVerificationCode] = useState("");
    const [cnameTarget, setCnameTarget] = useState("");
    const [domainLoading, setDomainLoading] = useState(false);
    const [plan, setPlan] = useState<"free" | "pro">("free");
    const [loading, setLoading] = useState(true);

    const protocol = process.env.NEXT_PUBLIC_FRONTEND_PROTOCOL || "http";
    const baseDomain = process.env.NEXT_PUBLIC_FRONTEND_BASE_DOMAIN || "localhost:3000";
    const subdomainLimitReached = subdomainChanges >= SUBDOMAIN_CHANGE_LIMIT;

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const res = await api.get("/store/config");
                const data = res.data.store;
                setPlan(data.plan || "free");
                setStoreName(data.storeName || "");
                setSubdomain(data.subdomain || "");
                setSavedSubdomain(data.subdomain || "");
                setSubdomainChanges(data.subdomainChanges || 0);
                setCustomDomain(data.customDomain || "");
                setCustomDomainStatus(data.customDomainStatus || "none");
                setVerificationCode(data.customDomainVerificationCode || "");
            } catch (error: any) {
                toast.error(error.message || "Failed to load settings.");
            } finally {
                setLoading(false);
            }
        };
        fetchStore();
    }, []);

    const handleSaveSubdomain = async () => {
        const next = subdomain.trim().toLowerCase();
        if (!next) {
            toast.error("Enter a store link first.");
            return;
        }
        setSavingSubdomain(true);
        try {
            const res = await api.put("/store/setup", { storeName, subdomain: next });
            setSubdomain(res.data.store.subdomain);
            setSavedSubdomain(res.data.store.subdomain);
            setSubdomainChanges(res.data.store.subdomainChanges ?? 0);
            setEditingSubdomain(false);
            setStoreName(res.data.store.storeName);
            dispatch(updateStoreInfo({
                storeName: res.data.store.storeName,
                subdomain: res.data.store.subdomain,
            }));
            toast.success(t("dashboard.settingsPage.subdomainSaved"));
        } catch (error: unknown) {
            const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
                || (error as Error).message
                || "Failed to update store link.";
            toast.error(msg);
        } finally {
            setSavingSubdomain(false);
        }
    };

    const handleRequestDomain = async () => {
        const value = customDomain.trim();
        if (!value) {
            toast.error("Enter your domain first.");
            return;
        }
        setDomainLoading(true);
        try {
            const res = await api.post("/store/config/domain/request", { domain: value });
            setCustomDomain(res.data.customDomain);
            setCustomDomainStatus(res.data.customDomainStatus);
            setVerificationCode(res.data.verificationCode);
            setCnameTarget(res.data.cnameTarget);
            toast.success("Domain connected. Add the DNS records below to verify.");
        } catch (error: any) {
            toast.error(error.message || "Failed to connect domain.");
        } finally {
            setDomainLoading(false);
        }
    };

    const handleVerifyDomain = async () => {
        setDomainLoading(true);
        try {
            const res = await api.post("/store/config/domain/verify");
            setCustomDomainStatus(res.data.customDomainStatus);
            if (res.data.success) {
                toast.success("Domain verified! Now live on your custom domain.");
                if (res.data.vercelAdded === false) {
                    toast("Note: full activation can take a few minutes.", { icon: "⏳" });
                }
            } else {
                toast.error("DNS record not found yet. Check records and try again.");
            }
        } catch (error: any) {
            setCustomDomainStatus("failed");
            toast.error(error.message || "Verification failed.");
        } finally {
            setDomainLoading(false);
        }
    };

    const handleRemoveDomain = async () => {
        setDomainLoading(true);
        try {
            await api.post("/store/config/domain/remove");
            setCustomDomain("");
            setCustomDomainStatus("none");
            setVerificationCode("");
            setCnameTarget("");
            toast.success("Custom domain removed.");
        } catch (error: any) {
            toast.error(error.message || "Failed to remove domain.");
        } finally {
            setDomainLoading(false);
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{t("dashboard.settingsPage.domainTitle")}</h1>
                <p className="text-gray-500 mt-1 text-sm">{t("dashboard.settingsPage.domainDesc")}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">{t("dashboard.settingsPage.subdomainTitle")}</h2>
                        <p className="text-xs text-gray-500 mt-0.5">{t("dashboard.settingsPage.subdomainDesc")}</p>
                    </div>
                    <p className="text-[11px] font-medium text-amber-600 sm:max-w-[190px] sm:text-right shrink-0">
                        {t("dashboard.settingsPage.subdomainSeoWarning")}
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="flex flex-1 rounded-xl shadow-sm min-w-0">
                        <input
                            type="text"
                            value={subdomain}
                            readOnly={!editingSubdomain}
                            onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                            required
                            minLength={3}
                            maxLength={30}
                            placeholder="my-store"
                            className={`w-full min-w-0 px-4 py-2.5 rounded-l-xl border border-gray-200 text-sm font-mono outline-none transition-all ${
                                editingSubdomain
                                    ? "bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                                    : "bg-gray-100 text-gray-500 cursor-not-allowed"
                            }`}
                        />
                        <span className={`inline-flex items-center rounded-r-xl border border-l-0 border-gray-200 px-2.5 text-[11px] whitespace-nowrap ${
                            editingSubdomain ? "bg-gray-50 text-gray-500" : "bg-gray-100 text-gray-400"
                        }`}>
                            .{baseDomain}
                        </span>
                    </div>
                    {!editingSubdomain ? (
                        <>
                            <span className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-bold shrink-0">
                                {t("dashboard.settingsPage.subdomainClaimed")}
                                <span aria-hidden>✓</span>
                            </span>
                            <button
                                type="button"
                                onClick={() => setEditingSubdomain(true)}
                                disabled={subdomainLimitReached}
                                title={subdomainLimitReached ? t("dashboard.settingsPage.subdomainLimitReached") : undefined}
                                className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors shrink-0 ${
                                    subdomainLimitReached
                                        ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                                        : "border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600"
                                }`}
                            >
                                {t("dashboard.settingsPage.subdomainChange")}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={handleSaveSubdomain}
                                disabled={savingSubdomain || !subdomain.trim()}
                                className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                            >
                                {savingSubdomain ? t("dashboard.settingsPage.subdomainSaving") : t("dashboard.settingsPage.subdomainSave")}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSubdomain(savedSubdomain);
                                    setEditingSubdomain(false);
                                }}
                                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-xs font-semibold hover:bg-gray-50 transition-colors shrink-0"
                            >
                                {t("dashboard.settingsPage.subdomainCancel")}
                            </button>
                        </>
                    )}
                </div>
                {savedSubdomain && (
                    <div className="space-y-1">
                        <p className="text-xs text-gray-500">
                            {t("dashboard.settingsPage.currentLink")}{" "}
                            <a
                                href={`${protocol}://${savedSubdomain}.${baseDomain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono font-semibold text-orange-600 hover:underline break-all"
                            >
                                {savedSubdomain}.{baseDomain}
                            </a>
                        </p>
                        <p className="text-xs text-gray-400">
                            {t("dashboard.settingsPage.subdomainChangesUsed")} {subdomainChanges}/{SUBDOMAIN_CHANGE_LIMIT}
                        </p>
                        {subdomainLimitReached && (
                            <p className="text-xs font-medium text-amber-600">
                                {t("dashboard.settingsPage.subdomainLimitReached")}
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-gray-900">{t("dashboard.settingsPage.customDomainTitle")}</h2>
                    <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${
                            customDomainStatus === "verified"
                                ? "bg-green-50 text-green-700"
                                : customDomainStatus === "pending"
                                ? "bg-amber-50 text-amber-700"
                                : customDomainStatus === "failed"
                                ? "bg-red-50 text-red-700"
                                : "bg-gray-100 text-gray-500"
                        }`}
                    >
                        {customDomainStatus === "verified"
                            ? t("dashboard.settingsPage.domainVerified")
                            : customDomainStatus === "pending"
                            ? t("dashboard.settingsPage.domainPending")
                            : customDomainStatus === "failed"
                            ? t("dashboard.settingsPage.domainFailed")
                            : t("dashboard.settingsPage.domainNone")}
                    </span>
                </div>

                {plan !== "pro" && (customDomainStatus === "none" || customDomainStatus === "failed") ? (
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 text-center">
                        <p className="text-sm font-bold text-gray-900">🔒 Custom domain is a Pro feature</p>
                        <p className="text-xs text-gray-500 mt-1">Connect your own domain like yourbrand.com</p>
                        <a
                            href={`/${language}/dashboard/billing`}
                            className="inline-block mt-3 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors"
                        >
                            Upgrade to Pro →
                        </a>
                    </div>
                ) : (
                    <>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={customDomain}
                                onChange={(e) => setCustomDomain(e.target.value)}
                                disabled={customDomainStatus === "verified" || (customDomainStatus === "pending" && !!customDomain)}
                                placeholder="youraddress.com"
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 text-sm font-mono outline-none transition-all disabled:bg-gray-50"
                            />
                            <button
                                type="button"
                                onClick={handleRequestDomain}
                                disabled={domainLoading || customDomainStatus === "verified"}
                                className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {domainLoading ? "..." : customDomainStatus === "pending" ? "Reconnect" : "Connect"}
                            </button>
                        </div>

                        {(customDomainStatus === "pending" || customDomainStatus === "failed") && verificationCode && (
                            <div className="space-y-3 bg-amber-50/60 border border-amber-200 rounded-xl p-4">
                                <div className="flex items-start gap-2.5 text-xs text-amber-900">
                                    <span className="mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    <p className="leading-relaxed">{t("dashboard.settingsPage.domainInstructions")}</p>
                                </div>

                                <div className="bg-white border border-amber-200 rounded-lg p-3 text-xs divide-y divide-gray-100">
                                    <div className="py-1.5">
                                        <p className="font-semibold text-gray-700 mb-0.5">{t("dashboard.settingsPage.domainTxtLabel")}</p>
                                        <p className="font-mono text-[11px] text-gray-600 break-all">
                                            vendoo-verify={verificationCode}
                                        </p>
                                    </div>
                                    {cnameTarget && (
                                        <div className="py-1.5">
                                            <p className="font-semibold text-gray-700 mb-0.5">{t("dashboard.settingsPage.domainCnameLabel")}</p>
                                            <p className="font-mono text-[11px] text-gray-600 break-all">
                                                {customDomain} → {cnameTarget}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleVerifyDomain}
                                    disabled={domainLoading}
                                    className="w-full py-2.5 rounded-xl bg-[#0E3B2C] hover:bg-[#0a2e22] text-white text-xs font-semibold transition-colors disabled:opacity-60"
                                >
                                    {domainLoading ? "Checking DNS..." : t("dashboard.settingsPage.domainVerify")}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleRemoveDomain}
                                    disabled={domainLoading}
                                    className="w-full py-2 rounded-xl border border-gray-200 bg-white text-gray-500 text-xs font-semibold hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-60"
                                >
                                    {t("dashboard.settingsPage.domainRemove")}
                                </button>
                            </div>
                        )}

                        {customDomainStatus === "verified" && (
                            <div className="flex items-center justify-between gap-3 bg-green-50/60 border border-green-200 rounded-xl p-4">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-green-800 break-all">{customDomain}</p>
                                    <p className="text-xs text-green-700 mt-0.5">{t("dashboard.settingsPage.domainLive")}</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <a
                                        href={`${protocol}://${customDomain}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-2 rounded-lg bg-green-700 hover:bg-green-800 text-white text-xs font-semibold transition-colors"
                                    >
                                        {t("dashboard.settingsPage.visitStore")}
                                    </a>
                                    <button
                                        type="button"
                                        onClick={handleRemoveDomain}
                                        disabled={domainLoading}
                                        className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-xs font-semibold hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-60"
                                    >
                                        {t("dashboard.settingsPage.domainRemove")}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}