"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { setUser } from "@/redux/authSlice";
import { fetchMe, updateProfile, changePassword } from "@/services/authService";

export default function LocalizedProfilePage() {
    const { t, language } = useTranslation();
    const dispatch = useDispatch();
    const { user } = useSelector((state: any) => state.auth);

    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);
    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [changing, setChanging] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const data = await fetchMe();
                if (data?.success) {
                    dispatch(setUser(data.user));
                    setName(data.user.name || "");
                }
            } catch {
                // shell handles auth
            } finally {
                setLoading(false);
            }
        })();
    }, [dispatch]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error(t("dashboard.profilePage.nameRequired"));
            return;
        }
        setSaving(true);
        try {
            const data = await updateProfile(name.trim());
            dispatch(setUser(data.user));
            toast.success(t("dashboard.profilePage.profileUpdated"));
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPw !== confirmPw) {
            toast.error(t("dashboard.profilePage.mismatch"));
            return;
        }
        if (newPw.length < 8) {
            toast.error(t("dashboard.profilePage.minLength"));
            return;
        }
        setChanging(true);
        try {
            await changePassword(currentPw, newPw);
            toast.success(t("dashboard.profilePage.passwordChanged"));
            setCurrentPw("");
            setNewPw("");
            setConfirmPw("");
        } catch (error: any) {
            toast.error(error.message || "Failed to change password.");
        } finally {
            setChanging(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
                <p className="text-sm text-gray-500">{t("dashboard.profilePage.loading")}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <Link href={`/${language}/dashboard`} className="text-xs text-gray-400 hover:text-gray-600">
                    ← {t("dashboard.overview")}
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{t("dashboard.profilePage.title")}</h1>
                <p className="text-gray-500 mt-1 text-sm">{t("dashboard.profilePage.subtitle")}</p>
            </div>

            {/* Personal info */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 rounded-full bg-orange-600 text-white font-extrabold text-2xl flex items-center justify-center shrink-0">
                        {(user?.name || user?.email || "V").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 capitalize">
                            {user?.role}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-3">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                            {t("dashboard.profilePage.fullName")}
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 text-sm outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                            {t("dashboard.profilePage.email")}
                        </label>
                        <input
                            type="email"
                            value={user?.email || ""}
                            disabled
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500 outline-none"
                        />
                        <p className="text-xs text-gray-400 mt-1">{t("dashboard.profilePage.emailLocked")}</p>
                    </div>
                    <div className="flex justify-end pt-1">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors disabled:opacity-60"
                        >
                            {saving ? "..." : t("dashboard.profilePage.save")}
                        </button>
                    </div>
                </form>
            </div>

            {/* Change password */}
            <form onSubmit={handleChangePassword} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3">
                <h2 className="text-sm font-bold text-gray-900">{t("dashboard.profilePage.changePassword")}</h2>
                <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        {t("dashboard.profilePage.currentPassword")}
                    </label>
                    <input
                        type="password"
                        value={currentPw}
                        onChange={(e) => setCurrentPw(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 text-sm outline-none"
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                            {t("dashboard.profilePage.newPassword")}
                        </label>
                        <input
                            type="password"
                            value={newPw}
                            onChange={(e) => setNewPw(e.target.value)}
                            required
                            minLength={8}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 text-sm outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                            {t("dashboard.profilePage.confirmPassword")}
                        </label>
                        <input
                            type="password"
                            value={confirmPw}
                            onChange={(e) => setConfirmPw(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 text-sm outline-none"
                        />
                    </div>
                </div>
                <div className="flex justify-end pt-1">
                    <button
                        type="submit"
                        disabled={changing}
                        className="px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-colors disabled:opacity-60"
                    >
                        {changing ? "..." : t("dashboard.profilePage.updatePassword")}
                    </button>
                </div>
            </form>
        </div>
    );
}
