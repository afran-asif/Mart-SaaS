"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { listSubRequests, approveSubRequest, rejectSubRequest, SubRequest } from "@/services/adminService";

export default function LocalizedAdminPage() {
    const { t } = useTranslation();
    const { user } = useSelector((state: any) => state.auth);
    const [requests, setRequests] = useState<SubRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("pending");
    const [acting, setActing] = useState<string | null>(null);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            setRequests(await listSubRequests(tab));
        } catch (error: any) {
            toast.error(error.message || "Failed to load requests.");
        } finally {
            setLoading(false);
        }
    }, [tab]);

    useEffect(() => {
        if (user?.role === "super-admin") fetchRequests();
        else setLoading(false);
    }, [user, fetchRequests]);

    if (user?.role !== "super-admin") {
        return (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center max-w-md mx-auto">
                <h3 className="text-base font-bold text-gray-900">{t("dashboard.adminPage.forbidden")}</h3>
                <p className="text-sm text-gray-500 mt-1">{t("dashboard.adminPage.forbiddenDesc")}</p>
            </div>
        );
    }

    const handleApprove = async (id: string) => {
        if (!window.confirm(t("dashboard.adminPage.approveConfirm"))) return;
        setActing(id);
        try {
            await approveSubRequest(id);
            toast.success(t("dashboard.adminPage.approved"));
            fetchRequests();
        } catch (error: any) {
            toast.error(error.message || "Approve failed.");
        } finally {
            setActing(null);
        }
    };

    const handleReject = async (id: string) => {
        const note = window.prompt(t("dashboard.adminPage.rejectNote") || "Reason (optional):") || "";
        setActing(id);
        try {
            await rejectSubRequest(id, note);
            toast.success(t("dashboard.adminPage.rejected"));
            fetchRequests();
        } catch (error: any) {
            toast.error(error.message || "Reject failed.");
        } finally {
            setActing(null);
        }
    };

    const storeLabel = (r: SubRequest) =>
        typeof r.storeId === "object" && r.storeId
            ? `${r.storeId.storeName || ""} (${r.storeId.subdomain || ""})`
            : String(r.storeId || "");

    return (
        <div className="space-y-5 sm:space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("dashboard.adminPage.title")}</h1>
                <p className="text-gray-500 mt-1 text-sm">{t("dashboard.adminPage.subtitle")}</p>
            </div>

            <div className="flex gap-2">
                {["pending", "active", "rejected"].map((s) => (
                    <button
                        key={s}
                        onClick={() => setTab(s)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${
                            tab === s ? "bg-orange-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {loading ? (
                <p className="text-gray-600 p-4 bg-white rounded-2xl border border-gray-100">{t("dashboard.adminPage.loading")}</p>
            ) : requests.length === 0 ? (
                <p className="text-gray-500 p-6 bg-white rounded-2xl border border-gray-100 text-center text-sm">{t("dashboard.adminPage.empty")}</p>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {requests.map((r) => (
                        <div key={r._id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-900 truncate">{storeLabel(r)}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{new Date(r.createdAt).toLocaleString()}</p>
                                </div>
                                <span className="font-mono font-bold text-orange-600">৳{r.amount}</span>
                            </div>
                            <div className="mt-3 bg-gray-50 rounded-xl p-3 text-xs space-y-1 font-mono">
                                <p><span className="text-gray-400">TrxID:</span> <span className="font-bold">{r.trxId || "—"}</span></p>
                                <p><span className="text-gray-400">Sender:</span> {r.senderNumber || "—"}</p>
                                {r.adminNote && <p><span className="text-gray-400">Note:</span> {r.adminNote}</p>}
                            </div>
                            {tab === "pending" && (
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => handleApprove(r._id)}
                                        disabled={acting === r._id}
                                        className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-colors disabled:opacity-60"
                                    >
                                        {t("dashboard.adminPage.approve")}
                                    </button>
                                    <button
                                        onClick={() => handleReject(r._id)}
                                        disabled={acting === r._id}
                                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-60"
                                    >
                                        {t("dashboard.adminPage.reject")}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}