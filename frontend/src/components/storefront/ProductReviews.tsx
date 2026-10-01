"use client";

import { useState, useEffect } from "react";
import { getTenantReviews, createTenantReview, TenantReview } from "@/services/reviewService";

export function Stars({ value, size = "text-sm" }: { value: number; size?: string }) {
    return (
        <span className={`inline-flex items-center gap-0.5 ${size}`} aria-label={`${value} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className={s <= Math.round(value) ? "text-amber-400" : "text-gray-300"}>
                    ★
                </span>
            ))}
        </span>
    );
}

export default function ProductReviews({ productId, theme = "classic" }: { productId: string; theme?: string }) {
    const isDark = theme === "bold" || theme === "luxe";
    const isLuxe = theme === "luxe";
    const [reviews, setReviews] = useState<TenantReview[]>([]);
    const [average, setAverage] = useState(0);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [orderId, setOrderId] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState("");
    const [msgOk, setMsgOk] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const fetchReviews = async () => {
        try {
            const data = await getTenantReviews(productId);
            setReviews(data.reviews || []);
            setAverage(data.average || 0);
            setCount(data.count || 0);
        } catch {
            /* silent */
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim() || rating < 1) return;
        setSubmitting(true);
        setMsg("");
        try {
            await createTenantReview({
                productId,
                customerName: name.trim(),
                phone: phone.trim(),
                rating,
                comment: comment.trim() || undefined,
                orderId: orderId.trim() || undefined,
            });
            setMsg("রিভিউ দেওয়ার জন্য ধন্যবাদ!");
            setMsgOk(true);
            setName("");
            setPhone("");
            setComment("");
            setOrderId("");
            setRating(5);
            fetchReviews();
        } catch (err: any) {
            setMsg(err.message || "রিভিউ জমা দেওয়া যায়নি।");
            setMsgOk(false);
        } finally {
            setSubmitting(false);
        }
    };

    const titleColor = isLuxe ? "text-[#d4af37]" : isDark ? "text-white" : "text-[#181410]";

    return (
        <section className="mt-12 sm:mt-16">
            <div className="flex items-center gap-3 mb-2">
                <span className="w-1 h-6 rounded-full bg-[#C6A15B]" />
                <h3 className={`font-['Fraunces',serif] text-xl sm:text-2xl font-semibold ${titleColor}`}>
                    রিভিউ {count > 0 && <span className="text-base font-normal opacity-70">({count})</span>}
                </h3>
            </div>

            {count > 0 && (
                <div className="flex items-center gap-2 mb-5">
                    <Stars value={average} size="text-lg" />
                    <span className={`font-['IBM_Plex_Mono'] text-sm font-bold ${titleColor}`}>{average.toFixed(1)}</span>
                    <span className={`text-xs ${isDark ? "text-white/50" : "text-[#75705F]"}`}>/ 5</span>
                </div>
            )}

            {loading ? (
                <p className={`text-sm ${isDark ? "text-white/50" : "text-[#75705F]"}`}>লোড হচ্ছে...</p>
            ) : (
                <div className="flex flex-col gap-3 mb-8">
                    {reviews.map((r, i) => (
                        <div key={r._id || i} className="bg-white border border-[#181410]/10 rounded-2xl p-4">
                            <div className="flex items-center justify-between gap-2">
                                <p className="font-semibold text-sm text-gray-900 truncate">{r.customerName}</p>
                                <Stars value={r.rating} />
                            </div>
                            {r.verifiedBuyer && (
                                <span className="inline-block mt-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                                    ✓ Verified buyer
                                </span>
                            )}
                            {r.comment && <p className="text-sm text-gray-700 mt-2 leading-relaxed">{r.comment}</p>}
                            <p className="text-[11px] text-gray-400 mt-1.5">
                                {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                            </p>
                        </div>
                    ))}
                    {reviews.length === 0 && (
                        <p className={`text-sm ${isDark ? "text-white/50" : "text-[#75705F]"}`}>
                            এখনো কোনো রিভিউ নেই — প্রথম রিভিউ আপনিই দিন!
                        </p>
                    )}
                </div>
            )}

            {/* Write a review — collapsible */}
            <button
                type="button"
                onClick={() => setShowForm(!showForm)}
                className="w-full sm:w-auto sm:self-start px-8 py-3 rounded-xl font-medium text-sm bg-[#0E3B2C] text-white hover:opacity-90 transition-all active:scale-95 touch-manipulation flex items-center justify-center gap-2"
            >
                রিভিউ লিখুন
                <span className={`inline-block transition-transform duration-200 ${showForm ? "rotate-180" : ""}`}>▾</span>
            </button>

            {showForm && (
            <form onSubmit={handleSubmit} className="bg-white border border-[#181410]/10 rounded-2xl p-5 flex flex-col gap-3 animate-expand-in">
                <h4 className="font-['Fraunces',serif] font-semibold text-lg text-[#181410]">রিভিউ লিখুন</h4>
                <div className="flex items-center gap-1.5">
                    <span className="text-sm text-gray-600">রেটিং:</span>
                    {[1, 2, 3, 4, 5].map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setRating(s)}
                            className={`text-2xl transition-transform active:scale-125 ${s <= rating ? "text-amber-400" : "text-gray-300"}`}
                            aria-label={`${s} star`}
                        >
                            ★
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="আপনার নাম"
                        className="px-4 py-2.5 rounded-xl border border-[#181410]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#F4501A]"
                    />
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        placeholder="ফোন নম্বর (01XXXXXXXXX)"
                        className="px-4 py-2.5 rounded-xl border border-[#181410]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#F4501A]"
                    />
                </div>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="পণ্যটি কেমন লাগলো? (ঐচ্ছিক)"
                    className="px-4 py-2.5 rounded-xl border border-[#181410]/15 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#F4501A]"
                />
                <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="অর্ডার ID (ঐচ্ছিক — Verified badge-এর জন্য)"
                    className="px-4 py-2.5 rounded-xl border border-[#181410]/15 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#F4501A]"
                />
                {msg && (
                    <p className={`text-sm rounded-xl px-3 py-2 ${msgOk ? "text-green-700 bg-green-50 border border-green-100" : "text-red-600 bg-red-50 border border-red-100"}`}>
                        {msg}
                    </p>
                )}
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto sm:self-start px-8 py-3 rounded-xl font-medium text-sm bg-[#0E3B2C] text-white hover:opacity-90 transition-all disabled:opacity-60 active:scale-95 touch-manipulation"
                >
                    {submitting ? "জমা হচ্ছে..." : "রিভিউ জমা দিন"}
                </button>
            </form>
            )}
        </section>
    );
}
