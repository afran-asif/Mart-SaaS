"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { registerVendor } from "@/services/authService";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function LocalizedRegisterPage() {
    const router = useRouter();
    const { t, language } = useTranslation();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        storeName: "",
        subdomain: "",
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const sub = params.get("subdomain");
            if (sub) {
                const cleanSub = sub.toLowerCase().replace(/[^a-z0-9-]/g, "-");
                setFormData((prev) => ({
                    ...prev,
                    subdomain: cleanSub,
                    storeName: prev.storeName || cleanSub.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                }));
            }
        }
    }, []);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const data = await registerVendor(formData);
            if (data.success) {
                router.push(`/${language}/verify-email?email=${encodeURIComponent(formData.email)}`);
            }
        } catch (error: any) {
            setMessage(error.response?.data?.message || "Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg">
                {/* Language Switcher */}
                <div className="flex justify-end">
                    <LanguageSwitcher variant="dark" />
                </div>

                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        {t("register.title")}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {t("register.subtitle")}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label className="text-sm font-medium text-gray-700">{t("register.fullName")}</label>
                            <input
                                name="name"
                                type="text"
                                required
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">{t("register.emailLabel")}</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                placeholder="vendor@sestone.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">{t("register.passwordLabel")}</label>
                            <input
                                name="password"
                                type="password"
                                required
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">{t("register.storeName")}</label>
                            <input
                                name="storeName"
                                type="text"
                                required
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                placeholder="Sestone Premium Gym"
                                value={formData.storeName}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">{t("register.subdomain")}</label>
                            <div className="mt-1 flex rounded-lg shadow-sm">
                                <input
                                    name="subdomain"
                                    type="text"
                                    required
                                    className="w-full rounded-l-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                    placeholder="af-gadgets-2"
                                    value={formData.subdomain}
                                    onChange={handleChange}
                                />
                                <span className="inline-flex items-center rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                                    .vendoo.shop
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-orange-400"
                        >
                            {loading ? t("register.creating") : t("register.registerButton")}
                        </button>
                    </div>

                    {message && (
                        <p className="mt-2 text-center text-sm font-medium text-gray-700">
                            {message}
                        </p>
                    )}
                </form>

                <div className="text-center pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                        {t("register.hasAccount")}{" "}
                        <Link href={`/${language}/login`} className="font-semibold text-orange-600 hover:text-orange-700">
                            {t("register.signIn")}
                        </Link>
                    </p>
                    <Link href={`/${language}`} className="mt-3 inline-block text-xs text-gray-400 hover:text-gray-600">
                        {t("register.backHome")}
                    </Link>
                </div>
            </div>
        </div>
    );
}
