"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { api } from "@/services/api";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";

export default function BrandingSettingsPage() {
    const { t, language } = useTranslation();
    const [brandColor, setBrandColor] = useState("#F4501A");
    const [heroTitle, setHeroTitle] = useState("");
    const [heroSubtitle, setHeroSubtitle] = useState("");
    const [heroImage, setHeroImage] = useState("");
    const [heroImageError, setHeroImageError] = useState(false);
    const [uploadingHero, setUploadingHero] = useState(false);
    const heroInputRef = useRef<HTMLInputElement>(null);
    const [theme, setTheme] = useState("classic");
    const [plan, setPlan] = useState<"free" | "pro">("free");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const res = await api.get("/store/config");
                const data = res.data.store;
                setBrandColor(data.brandColor || "#F4501A");
                setHeroTitle(data.heroTitle || "");
                setHeroSubtitle(data.heroSubtitle || "");
                setHeroImage(data.heroImage || "");
                setTheme(data.theme || "classic");
                setPlan(data.plan || "free");
            } catch (error: any) {
                toast.error(error.message || "Failed to load settings.");
            } finally {
                setLoading(false);
            }
        };
        fetchStore();
    }, []);

    const handleHeroFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setUploadingHero(true);
        try {
            const formData = new FormData();
            formData.append("heroImage", file);
            const res = await api.post("/store/hero-image", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setHeroImage(res.data.heroImage || "");
            setHeroImageError(false);
            toast.success("Hero image uploaded.");
        } catch (error: any) {
            toast.error(error.message || "Hero upload failed.");
        } finally {
            setUploadingHero(false);
            if (heroInputRef.current) heroInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put("/store/config", {
                brandColor: brandColor.trim() || null,
                heroTitle: heroTitle.trim() || null,
                heroSubtitle: heroSubtitle.trim() || null,
                heroImage: heroImage.trim() || null,
                theme,
            });
            if (res.data.proLocked?.length) {
                toast.error(`Pro required: ${res.data.proLocked.join(", ")} not saved. Upgrade from Billing.`);
            } else {
                toast.success("Branding updated.");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update settings.");
        } finally {
            setSaving(false);
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">Branding & Hero</h1>
                <p className="text-gray-500 mt-1 text-sm">Customize your storefront colors and hero banner.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Brand Color</label>
                        <div className="flex items-center gap-3">
                            <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 p-1 bg-white" />
                            <input type="text" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} placeholder="#F4501A" className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 text-sm font-mono outline-none" />
                            <span className="w-6 h-6 rounded-full border border-gray-200" style={{ background: brandColor }} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Hero Title</label>
                        <input type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="e.g. Summer Collection 2026" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 text-sm outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Hero Subtitle</label>
                        <textarea value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} placeholder="Short tagline under title" rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 text-sm outline-none resize-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Hero Banner Image</label>
                        <div className="flex items-center gap-3">
                            <div className="w-20 h-14 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                                {heroImage.trim() && !heroImageError ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={heroImage} alt="Hero" className="w-full h-full object-cover" onError={() => setHeroImageError(true)} />
                                ) : (
                                    <span className="text-gray-300 text-lg">🖼️</span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button type="button" onClick={() => heroInputRef.current?.click()} disabled={uploadingHero} className="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 disabled:opacity-60">
                                    {uploadingHero ? "Uploading..." : heroImage.trim() ? "Change banner" : "Upload banner"}
                                </button>
                                {heroImage.trim() && !uploadingHero && (
                                    <button type="button" onClick={() => { setHeroImage(""); setHeroImageError(false); }} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:border-red-300 hover:text-red-600">
                                        Remove
                                    </button>
                                )}
                            </div>
                            <input ref={heroInputRef} type="file" accept="image/*" className="hidden" onChange={handleHeroFileChange} />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Recommended 1200×400, will be overlayed with brand color.</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                    <div>
                        <h2 className="text-sm font-bold text-gray-900">Store Theme</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Free: classic, minimal, vibrant · Pro: all 9 themes.</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                            { id: "classic", name: "Classic", desc: "Warm & rounded", bg: "bg-[#FFFDF7] border-[#C6A15B]/40" },
                            { id: "minimal", name: "Minimal", desc: "Clean & sharp", bg: "bg-white border-gray-200" },
                            { id: "bold", name: "Bold", desc: "Dark & strong", bg: "bg-[#0a0a0a] border-white/20" },
                            { id: "elegant", name: "Elegant", desc: "Soft & refined", bg: "bg-[#fdfbf7] border-[#e8e0d0]" },
                            { id: "vibrant", name: "Vibrant", desc: "Colorful & fun", bg: "bg-gradient-to-br from-orange-50 to-pink-50 border-orange-200" },
                            { id: "retro", name: "Retro", desc: "Vintage 70s", bg: "bg-[#fff8dc] border-[#d2b48c]" },
                            { id: "luxe", name: "Luxe", desc: "Gold & black", bg: "bg-[#111] border-[#d4af37]/30" },
                            { id: "pastel", name: "Pastel", desc: "Soft pink/purple", bg: "bg-pink-50 border-pink-200" },
                            { id: "urban", name: "Urban", desc: "Street gray", bg: "bg-gray-100 border-gray-300" },
                        ].map((th) => {
                            const locked = plan !== "pro" && !["classic", "minimal", "vibrant"].includes(th.id);
                            return (
                            <button
                                key={th.id}
                                type="button"
                                onClick={() => {
                                    if (locked) {
                                        toast.error("This theme is Pro-only. Upgrade from Billing.");
                                        return;
                                    }
                                    setTheme(th.id);
                                }}
                                className={`relative p-3 rounded-xl border-2 text-left transition-all ${theme === th.id ? "border-orange-500 ring-2 ring-orange-500/20" : "border-gray-200 hover:border-gray-300"} ${th.bg} ${locked ? "opacity-70" : ""}`}
                            >
                                {locked && (
                                    <span className="absolute top-2 right-2 text-[10px] font-bold bg-gray-900 text-white px-1.5 py-0.5 rounded-md">
                                        🔒 Pro
                                    </span>
                                )}
                                <div className={`w-full h-14 rounded-lg mb-2 border ${theme === th.id ? "border-orange-300" : "border-black/5"} ${th.id === "bold" ? "bg-[#1a1a1a]" : th.id === "minimal" ? "bg-gray-50" : th.id === "elegant" ? "bg-[#f5efe6]" : th.id === "vibrant" ? "bg-gradient-to-br from-orange-200 to-pink-200" : "bg-[#F4EEE2]"}`} />
                                <p className={`text-xs font-bold ${th.id === "luxe" ? "text-[#d4af37]" : th.id === "bold" ? "text-white" : "text-gray-900"}`}>{th.name}</p>
                                <p className={`text-[11px] ${th.id === "luxe" ? "text-[#d4af37]/60" : th.id === "bold" ? "text-white/60" : "text-gray-500"}`}>{th.desc}</p>
                            </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
                    >
                        {saving && (
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        {saving ? t("dashboard.settingsPage.savingButton") : t("dashboard.settingsPage.saveButton")}
                    </button>
                </div>
            </form>
        </div>
    );
}