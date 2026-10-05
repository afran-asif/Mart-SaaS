"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { sendOrderToSteadfast, refreshCourierStatus } from "@/services/courierService";

interface CourierPanelProps {
    orderId: string;
    orderStatus: string;
    initialConsignmentId?: string | null;
    initialTrackingCode?: string | null;
    initialCourierStatus?: string | null;
    initialSyncedAt?: string | null;
}

/** Dashboard order detail-এ Steadfast পাঠানো + tracking — local state-এ update হয় */
export default function CourierPanel({
    orderId,
    orderStatus,
    initialConsignmentId,
    initialTrackingCode,
    initialCourierStatus,
    initialSyncedAt,
}: CourierPanelProps) {
    const [consignmentId, setConsignmentId] = useState(initialConsignmentId || null);
    const [trackingCode, setTrackingCode] = useState(initialTrackingCode || null);
    const [courierStatus, setCourierStatus] = useState(initialCourierStatus || null);
    const [syncedAt, setSyncedAt] = useState(initialSyncedAt || null);
    const [sending, setSending] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const handleSend = async () => {
        setSending(true);
        try {
            const data = await sendOrderToSteadfast(orderId);
            setConsignmentId(data.consignmentId);
            setTrackingCode(data.trackingCode || null);
            setCourierStatus("created");
            setSyncedAt(new Date().toISOString());
            toast.success("Order sent to Steadfast.");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message || "Failed to send to Steadfast.");
        } finally {
            setSending(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const data = await refreshCourierStatus(orderId);
            setCourierStatus(data.courierStatus);
            setSyncedAt(data.syncedAt);
            toast.success("Courier status updated.");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message || "Failed to refresh status.");
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                🚚 Courier — Steadfast
            </h3>
            {!consignmentId ? (
                <div>
                    <p className="text-xs text-gray-500 mb-3">
                        এই অর্ডার এখনো কুরিয়ারে পাঠানো হয়নি। পাঠালে tracking code এখানে দেখাবে।
                    </p>
                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={sending || orderStatus === "Cancelled"}
                        className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {sending && (
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        {sending ? "Sending..." : "Send to Steadfast"}
                    </button>
                </div>
            ) : (
                <div className="space-y-2 text-xs text-gray-600">
                    <p>
                        <span className="font-semibold text-gray-800 mr-1">Consignment:</span>
                        <span className="font-mono font-bold text-gray-900">{consignmentId}</span>
                    </p>
                    {trackingCode && (
                        <p>
                            <span className="font-semibold text-gray-800 mr-1">Tracking:</span>
                            <span className="font-mono font-bold text-orange-700">{trackingCode}</span>
                        </p>
                    )}
                    <p className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-800">Status:</span>
                        <span className="inline-block px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-semibold capitalize">
                            {(courierStatus || "created").replace(/_/g, " ")}
                        </span>
                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="font-bold text-orange-700 hover:text-orange-800 hover:underline underline-offset-2 disabled:opacity-50"
                        >
                            {refreshing ? "Checking..." : "↻ Refresh"}
                        </button>
                    </p>
                    {syncedAt && (
                        <p className="text-[11px] text-gray-400">
                            Last checked: {new Date(syncedAt).toLocaleString()}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
