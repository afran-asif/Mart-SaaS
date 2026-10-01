"use client";

import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { getVendorReviews, toggleReviewVisibility, deleteVendorReview, VendorReview } from "@/services/reviewService";
import { Stars } from "@/components/storefront/ProductReviews";

export default function LocalizedReviewsPage() {
    const { t } = useTranslation();
    const [reviews, setReviews] = useState<VendorReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState<string | null>(null);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            setReviews(await getVendorReviews());
        } catch (error: any) {
            toast.error(error.message || "Failed to load reviews.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleToggle = async (id: string) => {
        setActing(id);
        try {
            await toggleReviewVisibility(id);
            fetchReviews();
        } catch (error: any) {
            toast.error(error.message || "Failed.");
        } finally {
            setActing(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(t("dashboard.reviewsPage.deleteConfirm"))) return;
        setActing(id);
        try {
            await deleteVendorReview(id);
            toast.success(t("dashboard.reviewsPage.deleted"));
            fetchReviews();
        } catch (error: any) {
            toast.error(error.message || "Failed.");
        } finally {
            setActing(null);
        }
    };

    const productName = (r: VendorReview) =>
        typeof r.productId === "object" && r.productId ? r.productId.name : "";

    return (
        <div className="space-y-5 sm:space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("dashboard.reviewsPage.title")}</h1>
                <p className="text-gray-500 mt-1 text-sm">{t("dashboard.reviewsPage.subtitle")}</p>
            </div>

            {loading ? (
                <p className="text-gray-600 p-4 bg-white rounded-2xl border border-gray-100">{t("dashboard.reviewsPage.loading")}</p>
            ) : reviews.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-400">{t("dashboard.reviewsPage.empty")}</p>
                </div>
            ) : (
                <>
                    {/* Mobile cards */}
                    <div className="md:hidden space-y-3">
                        {reviews.map((r) => (
                            <div key={r._id} className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 ${!r.visible ? "opacity-60" : ""}`}>
                                <div className="flex items-center justify-between gap-2">
                                    <p className="font-semibold text-gray-900 text-sm truncate">{r.customerName}</p>
                                    <Stars value={r.rating} />
                                </div>
                                <p className="text-xs text-orange-700 font-medium mt-0.5 truncate">{productName(r)}</p>
                                {r.verifiedBuyer && (
                                    <span className="inline-block mt-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">✓ Verified</span>
                                )}
                                {r.comment && <p className="text-sm text-gray-700 mt-2">{r.comment}</p>}
                                <div className="flex gap-2 mt-3">
                                    <button onClick={() => handleToggle(r._id)} disabled={acting === r._id} className="flex-1 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg disabled:opacity-50">
                                        {r.visible ? t("dashboard.reviewsPage.hide") : t("dashboard.reviewsPage.show")}
                                    </button>
                                    <button onClick={() => handleDelete(r._id)} disabled={acting === r._id} className="flex-1 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 rounded-lg disabled:opacity-50">
                                        {t("dashboard.reviewsPage.delete")}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop table */}
                    <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[640px]">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                    <th className="py-3 px-5">{t("dashboard.reviewsPage.customer")}</th>
                                    <th className="py-3 px-5">{t("dashboard.reviewsPage.product")}</th>
                                    <th className="py-3 px-5">{t("dashboard.reviewsPage.rating")}</th>
                                    <th className="py-3 px-5">{t("dashboard.reviewsPage.review")}</th>
                                    <th className="py-3 px-5 text-right">{t("dashboard.reviewsPage.actions")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {reviews.map((r) => (
                                    <tr key={r._id} className={`hover:bg-gray-50/50 ${!r.visible ? "opacity-60" : ""}`}>
                                        <td className="py-3.5 px-5">
                                            <p className="font-semibold text-gray-900">{r.customerName}</p>
                                            {r.verifiedBuyer && <span className="text-[11px] font-semibold text-green-700">✓ Verified</span>}
                                        </td>
                                        <td className="py-3.5 px-5 text-gray-700">{productName(r)}</td>
                                        <td className="py-3.5 px-5"><Stars value={r.rating} /></td>
                                        <td className="py-3.5 px-5 text-gray-600 max-w-[220px] truncate">{r.comment || "—"}</td>
                                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                                            <button onClick={() => handleToggle(r._id)} disabled={acting === r._id} className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50">
                                                {r.visible ? t("dashboard.reviewsPage.hide") : t("dashboard.reviewsPage.show")}
                                            </button>
                                            <button onClick={() => handleDelete(r._id)} disabled={acting === r._id} className="ml-2 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50">
                                                {t("dashboard.reviewsPage.delete")}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
