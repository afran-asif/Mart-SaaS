"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { setUser } from "@/redux/authSlice";
import { fetchMe, updateProfile, changePassword, uploadAvatar, removeAvatar } from "@/services/authService";

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
    const [uploading, setUploading] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be under 5MB.");
            return;
        }
        setUploading(true);
        try {
            const data = await uploadAvatar(file);
            dispatch(setUser(data.user));
            toast.success("Profile picture updated.");
        } catch (error: any) {
            toast.error(error.message || "Failed to upload picture.");
        } finally {
            setUploading(false);
            if (avatarInputRef.current) avatarInputRef.current.value = "";
        }
    };

    const handleAvatarRemove = async () => {
        setUploading(true);
        try {
            const data = await removeAvatar();
            dispatch(setUser(data.user));
            toast.success("Profile picture removed.");
        } catch (error: any) {
            toast.error(error.message || "Failed to remove picture.");
        } finally {
            setUploading(false);
        }
    };

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
                    <div className="relative shrink-0">
                        {user?.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={user.avatar}
                                alt={user?.name || "Profile"}
                                className="w-16 h-16 rounded-full object-cover ring-2 ring-orange-100"
                            />
                        ) : (
                            <button
                                type="button"
                                onClick={() => avatarInputRef.current?.click()}
                                disabled={uploading}
                                className="w-16 h-16 rounded-full bg-orange-50 border-2 border-dashed border-orange-300 text-orange-700 flex flex-col items-center justify-center gap-0.5 hover:bg-orange-100 hover:border-orange-400 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-[8px] font-bold leading-none">Add photo</span>
                            </button>
                        )}
                        {uploading && (
                            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 capitalize">
                            {user?.role}
                        </span>
                        <div className="flex items-center gap-2 mt-2">
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                            {user?.avatar && (
                                <button
                                    type="button"
                                    onClick={() => avatarInputRef.current?.click()}
                                    disabled={uploading}
                                    className="text-[11px] font-bold text-orange-700 hover:text-orange-800 hover:underline underline-offset-2 disabled:opacity-50"
                                >
                                    Change photo
                                </button>
                            )}
                            {user?.avatar && (
                                <button
                                    type="button"
                                    onClick={handleAvatarRemove}
                                    disabled={uploading}
                                    className="text-[11px] font-bold text-gray-400 hover:text-red-600 hover:underline underline-offset-2 disabled:opacity-50"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
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
