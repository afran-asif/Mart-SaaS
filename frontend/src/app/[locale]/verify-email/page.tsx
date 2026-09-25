"use client";
import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { verifyEmailToken, resendVerificationEmail } from "@/services/authService";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

function VerifyEmailContent() {
    const { t, language } = useTranslation();
    const [status, setStatus] = useState<"loading" | "success" | "error" | "sent" | "form">("loading");
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");
    const [resendEmail, setResendEmail] = useState("");

    useEffect(() => {
        if (typeof window === "undefined") return;

        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const emailParam = params.get("email");

        if (token) {
            setStatus("loading");
            verifyEmailToken(token)
                .then(() => setStatus("success"))
                .catch((err: any) => {
                    setMessage(err.message || t("verifyEmail.invalid"));
                    setStatus("error");
                });
        } else if (emailParam) {
            setEmail(emailParam);
            setStatus("sent");
        } else {
            setStatus("form");
        }
    }, [t]);

    const handleResend = async (e: React.FormEvent) => {
        e.preventDefault();
        const target = email || resendEmail;
        if (!target) return;

        setMessage("");
        try {
            await resendVerificationEmail(target);
            setEmail(target);
            setStatus("sent");
        } catch (err: any) {
            setMessage(err.message || "Something went wrong!");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg">
                <div className="flex justify-end">
                    <LanguageSwitcher variant="dark" />
                </div>

                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-3xl">
                        {status === "success" ? "✅" : status === "loading" ? "⏳" : "✉️"}
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900">
                        {status === "loading" && t("verifyEmail.verifying")}
                        {status === "success" && t("verifyEmail.success")}
                        {status === "error" && t("verifyEmail.invalid")}
                        {status === "sent" && t("verifyEmail.sent")}
                        {status === "form" && t("verifyEmail.enterEmail")}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {status === "success" && t("verifyEmail.successSub")}
                        {status === "error" && (message || t("verifyEmail.invalidSub"))}
                        {status === "sent" && (
                            <>
                                {t("verifyEmail.checkInbox")}{" "}
                                <span className="font-semibold text-orange-600">{email}</span>
                            </>
                        )}
                        {status === "form" && t("verifyEmail.enterEmailSub")}
                    </p>
                </div>

                {(status === "form" || status === "error") && (
                    <form className="mt-6 space-y-4" onSubmit={handleResend}>
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                {t("verifyEmail.emailLabel")}
                            </label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                placeholder="you@example.com"
                                value={resendEmail || email}
                                onChange={(e) => setResendEmail(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                        >
                            {t("verifyEmail.resend")}
                        </button>
                        {message && (
                            <p className="mt-2 text-center text-sm font-medium text-gray-700">{message}</p>
                        )}
                    </form>
                )}

                {status === "sent" && (
                    <button
                        onClick={handleResend}
                        className="mt-6 flex w-full justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    >
                        {t("verifyEmail.resend")}
                    </button>
                )}

                {status === "success" && (
                    <Link
                        href={`/${language}/login`}
                        className="mt-6 flex w-full justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    >
                        {t("verifyEmail.goLogin")}
                    </Link>
                )}

                <div className="text-center border-t border-gray-100 pt-4">
                    <Link href={`/${language}`} className="text-xs text-gray-400 hover:text-gray-600">
                        {t("verifyEmail.backHome")}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={null}>
            <VerifyEmailContent />
        </Suspense>
    );
}