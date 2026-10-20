"use client";

import React, { useState } from "react";
import { api } from "@/services/api";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface StoreSetupModalProps {
    initialStoreName: string;
    initialSubdomain: string;
    onDone: (store: { storeName: string; subdomain: string }) => void;
    onSkip: () => void;
}

export default function StoreSetupModal({ initialStoreName, initialSubdomain, onDone, onSkip }: StoreSetupModalProps) {
    const { t } = useTranslation();
    const [storeName, setStoreName] = useState(initialStoreName);
    const [subdomain, setSubdomain] = useState(initialSubdomain);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const baseDomain = process.env.NEXT_PUBLIC_FRONTEND_BASE_DOMAIN || "localhost:3000";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            const res = await api.put("/store/setup", { storeName: storeName.trim(), subdomain });
            toast.success(t("storeSetup.saved"));
            onDone(res.data.store);
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                || (err as Error).message
                || t("storeSetup.saveFailed");
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <h2 className="text-xl font-extrabold text-gray-900">{t("storeSetup.title")}</h2>
                <p className="mt-1 text-sm text-gray-500">{t("storeSetup.subtitle")}</p>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">{t("storeSetup.storeNameLabel")}</label>
                        <input
                            type="text"
                            required
                            maxLength={80}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                            placeholder={t("storeSetup.storeNamePlaceholder")}
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">{t("storeSetup.subdomainLabel")}</label>
                        <div className="mt-1 flex rounded-lg shadow-sm">
                            <input
                                type="text"
                                required
                                minLength={3}
                                maxLength={30}
                                className="w-full rounded-l-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                placeholder={t("storeSetup.subdomainPlaceholder")}
                                value={subdomain}
                                onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                            />
                            <span className="inline-flex items-center rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 px-2.5 text-xs text-gray-500">
                                .{baseDomain}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-400">{t("storeSetup.subdomainHint")}</p>
                    </div>

                    {error && (
                        <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-600">
                            {error}
                        </p>
                    )}

                    <div className="flex gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onSkip}
                            disabled={saving}
                            className="w-1/3 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60"
                        >
                            {t("storeSetup.skip")}
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-2/3 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:bg-orange-400"
                        >
                            {saving ? t("storeSetup.saving") : t("storeSetup.save")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
