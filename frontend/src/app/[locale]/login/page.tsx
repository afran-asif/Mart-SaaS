"use client";
import React, { useState } from "react";
import Link from "next/link";
import { loginVendor } from "@/services/authService";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/redux/authSlice";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function LocalizedLoginPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { t, language } = useTranslation();
    const [formData, setFormData] = useState({ email: "", password: "" });
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
            const data = await loginVendor(formData);
            if (data.success) {
                dispatch(setCredentials({ user: data.user, store: data.store, token: data.token }));

                if (data.token) {
                    localStorage.setItem("token", data.token);
                }
                setMessage(t("login.loginSuccess"));
                setTimeout(() => {
                    router.push(`/${language}/dashboard`);
                }, 1500);
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || "Login failed!";
            setMessage(errorMsg);
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
                        {t("login.title")}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {t("login.subtitle")}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label className="text-sm font-medium text-gray-700">{t("login.emailLabel")}</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                placeholder="vendor@mart.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700">{t("login.passwordLabel")}</label>
                                <Link href={`/${language}/forgot-password`} className="text-xs font-semibold text-orange-600 hover:text-orange-700">
                                    {t("login.forgotPassword")}
                                </Link>
                            </div>
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
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-orange-400"
                        >
                            {loading ? t("login.authenticating") : t("login.signIn")}
                        </button>
                    </div>

                    {message && (
                        <div className="mt-2 text-center">
                            <p className="text-sm font-medium text-gray-700">{message}</p>
                            {message.toLowerCase().includes("verify") && formData.email && (
                                <Link
                                    href={`/${language}/verify-email?email=${encodeURIComponent(formData.email)}`}
                                    className="mt-1 inline-block text-xs font-semibold text-orange-600 hover:text-orange-700"
                                >
                                    {t("login.resendVerify")}
                                </Link>
                            )}
                        </div>
                    )}
                </form>

                <div className="text-center pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                        {t("login.noAccount")}{" "}
                        <Link href={`/${language}/register`} className="font-semibold text-orange-600 hover:text-orange-700">
                            {t("login.createStore")}
                        </Link>
                    </p>
                    <Link href={`/${language}`} className="mt-3 inline-block text-xs text-gray-400 hover:text-gray-600">
                        {t("login.backHome")}
                    </Link>
                </div>
            </div>
        </div>
    );
}
