"use client";
import React, { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/services/authService";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function ForgotPasswordPage() {
    const { t, language } = useTranslation();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            await forgotPassword(email);
            setSent(true);
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
                        {t("forgotPassword.title")}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {t("forgotPassword.subtitle")}
                    </p>
                </div>

                {sent ? (
                    <div className="text-center space-y-4">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-3xl">✉️</div>
                        <p className="text-sm text-gray-600">{t("forgotPassword.success")}</p>
                        <Link
                            href={`/${language}/login`}
                            className="block w-full rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
                        >
                            {t("forgotPassword.backLogin")}
                        </Link>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                {t("forgotPassword.emailLabel")}
                            </label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-orange-400"
                        >
                            {loading ? t("forgotPassword.sending") : t("forgotPassword.send")}
                        </button>

                        {message && (
                            <p className="mt-2 text-center text-sm font-medium text-red-600">{message}</p>
                        )}
                    </form>
                )}

                <div className="text-center border-t border-gray-100 pt-4">
                    <Link href={`/${language}/login`} className="text-xs text-gray-400 hover:text-gray-600">
                        {t("forgotPassword.backLogin")}
                    </Link>
                </div>
            </div>
        </div>
    );
}