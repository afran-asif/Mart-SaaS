"use client";
import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/services/authService";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

function ResetPasswordContent() {
    const { t, language } = useTranslation();
    const [token, setToken] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const params = new URLSearchParams(window.location.search);
        setToken(params.get("token") || "");
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        if (!token) {
            setMessage(t("resetPassword.invalidLink"));
            return;
        }
        if (password !== confirm) {
            setMessage(t("resetPassword.mismatch"));
            return;
        }
        if (password.length < 6) {
            setMessage(t("resetPassword.tooShort"));
            return;
        }

        setLoading(true);
        try {
            await resetPassword(token, password);
            setDone(true);
        } catch (err: any) {
            setMessage(err.message || "Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg">
                <div className="flex justify-end">
                    <LanguageSwitcher variant="dark" />
                </div>

                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        {t("resetPassword.title")}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {t("resetPassword.subtitle")}
                    </p>
                </div>

                {done ? (
                    <div className="text-center space-y-4">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">✅</div>
                        <p className="text-sm text-gray-600">{t("resetPassword.success")}</p>
                        <Link
                            href={`/${language}/login`}
                            className="block w-full rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
                        >
                            {t("resetPassword.goLogin")}
                        </Link>
                    </div>
                ) : (
                    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                {t("resetPassword.newPassword")}
                            </label>
                            <input
                                name="password"
                                type="password"
                                required
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                {t("resetPassword.confirmPassword")}
                            </label>
                            <input
                                name="confirm"
                                type="password"
                                required
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                placeholder="••••••••"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-orange-400"
                        >
                            {loading ? t("resetPassword.submitting") : t("resetPassword.submit")}
                        </button>

                        {message && (
                            <p className="mt-2 text-center text-sm font-medium text-red-600">{message}</p>
                        )}
                    </form>
                )}

                <div className="text-center border-t border-gray-100 pt-4">
                    <Link href={`/${language}/login`} className="text-xs text-gray-400 hover:text-gray-600">
                        {t("resetPassword.backLogin")}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={null}>
            <ResetPasswordContent />
        </Suspense>
    );
}