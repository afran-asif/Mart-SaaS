"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, type Coupon } from "@/services/couponService";
import { useTranslation } from "@/hooks/useTranslation";
import { useSubscription } from "@/hooks/useSubscription";

export default function LocalizedCouponsPage() {
    const { t, language } = useTranslation();
    const { sub } = useSubscription();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Coupon | null>(null);
    const [form, setForm] = useState({ code: "", discountType: "percent" as "percent" | "fixed", discountValue: "", minOrderAmount: "", maxUses: "", expiresAt: "", isActive: true });

    const fetchCoupons = async () => {
        try {
            const data = await getCoupons();
            setCoupons(data);
        } catch { toast.error("Failed to load coupons"); } finally { setLoading(false); }
    };
    useEffect(() => { fetchCoupons(); }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ code: "", discountType: "percent", discountValue: "", minOrderAmount: "", maxUses: "", expiresAt: "", isActive: true });
        setShowModal(true);
    };
    const openEdit = (c: Coupon) => {
        setEditing(c);
        setForm({
            code: c.code,
            discountType: c.discountType,
            discountValue: String(c.discountValue),
            minOrderAmount: String(c.minOrderAmount || ""),
            maxUses: c.maxUses ? String(c.maxUses) : "",
            expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
            isActive: c.isActive,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = {
                code: form.code.trim(),
                discountType: form.discountType,
                discountValue: Number(form.discountValue),
                minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
                maxUses: form.maxUses ? Number(form.maxUses) : null,
                expiresAt: form.expiresAt || null,
                isActive: form.isActive,
            };
            if (editing) await updateCoupon(editing._id, payload);
            else await createCoupon(payload);
            toast.success(editing ? t("dashboard.couponsPage.updated") : t("dashboard.couponsPage.created"));
            setShowModal(false);
            fetchCoupons();
        } catch (err: any) { toast.error(err.message || "Failed"); }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(t("dashboard.couponsPage.deleteConfirm"))) return;
        try { await deleteCoupon(id); toast.success(t("dashboard.couponsPage.deleted")); fetchCoupons(); } catch (err: any) { toast.error(err.message); }
    };

    return (
        <div className="space-y-5 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("dashboard.couponsPage.title")}</h1>
                    <p className="text-gray-500 mt-1 text-sm">{t("dashboard.couponsPage.subtitle")}</p>
                </div>
                <button onClick={openCreate} className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-sm">+ {t("dashboard.couponsPage.addButton")}</button>
            </div>

            {sub && sub.plan !== "pro" && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <p className="text-sm text-gray-700 flex-1">🔒 Coupons are a Pro feature. Upgrade to create discount codes.</p>
                    <a href={`/${language}/dashboard/billing`} className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold whitespace-nowrap transition-colors">
                        Upgrade to Pro →
                    </a>
                </div>
            )}

            {loading ? (
                <p className="text-gray-600 p-4 bg-white rounded-2xl border border-gray-100">{t("dashboard.couponsPage.loading")}</p>
            ) : coupons.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100"><p className="text-gray-400">{t("dashboard.couponsPage.empty")}</p></div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[720px]">
                        <thead>
                            <tr className="border-b border-gray-100 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                <th className="py-3 px-5">Code</th>
                                <th className="py-3 px-5">Discount</th>
                                <th className="py-3 px-5">Min Order</th>
                                <th className="py-3 px-5">Uses</th>
                                <th className="py-3 px-5">Expiry</th>
                                <th className="py-3 px-5">Status</th>
                                <th className="py-3 px-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {coupons.map((c) => (
                                <tr key={c._id} className="hover:bg-gray-50/50">
                                    <td className="py-3.5 px-5 font-mono font-bold text-gray-900">{c.code}</td>
                                    <td className="py-3.5 px-5">{c.discountType === "percent" ? `${c.discountValue}%` : `৳${c.discountValue}`}</td>
                                    <td className="py-3.5 px-5">৳{c.minOrderAmount}</td>
                                    <td className="py-3.5 px-5">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : " / ∞"}</td>
                                    <td className="py-3.5 px-5 text-xs text-gray-500">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}</td>
                                    <td className="py-3.5 px-5"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${c.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>{c.isActive ? "Active" : "Inactive"}</span></td>
                                    <td className="py-3.5 px-5 text-right">
                                        <button onClick={() => openEdit(c)} className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg">Edit</button>
                                        <button onClick={() => handleDelete(c._id)} className="ml-2 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-8 w-full sm:max-w-md shadow-xl border border-gray-100 max-h-[92vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{editing ? "Edit Coupon" : "Create Coupon"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Code</label>
                                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SAVE10" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono" required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Type</label>
                                    <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as any })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white">
                                        <option value="percent">Percent %</option>
                                        <option value="fixed">Fixed ৳</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Value</label>
                                    <input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} placeholder="10" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" required min={1} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Min Order ৳</label>
                                    <input type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} placeholder="0" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" min={0} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Max Uses</label>
                                    <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="∞" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" min={1} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Expiry Date</label>
                                <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" /> Active
                            </label>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-xl">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-sm">{editing ? "Update" : "Create"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}