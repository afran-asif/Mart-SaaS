"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getCustomers, type Customer } from "@/services/customerService";
import { useTranslation } from "@/hooks/useTranslation";

export default function LocalizedCustomersPage() {
    const { t } = useTranslation();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debounced, setDebounced] = useState("");
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    useEffect(() => {
        const id = setTimeout(() => setDebounced(search), 500);
        return () => clearTimeout(id);
    }, [search]);

    useEffect(() => { setPage(1); }, [debounced]);

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getCustomers({ page, limit, search: debounced || undefined });
            setCustomers(data.customers || []);
            setPages(data.pages || 1);
            setTotal(data.totalCustomers || 0);
        } catch {
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    }, [page, debounced]);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    const formatDate = (d?: string) => {
        if (!d) return "—";
        const dt = new Date(d);
        return isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString();
    };

    return (
        <div className="space-y-5 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("dashboard.customersPage.title")}</h1>
                    <p className="text-gray-500 mt-1 text-sm">{t("dashboard.customersPage.subtitle")}</p>
                </div>
                <span className="text-xs font-semibold bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full">{total} {t("dashboard.customersPage.totalCustomers")}</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t("dashboard.customersPage.searchPlaceholder")}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm text-gray-900"
                    />
                    <span className="absolute left-3 top-3 text-gray-400 text-sm">🔍</span>
                </div>
            </div>

            {loading ? (
                <p className="text-gray-600 font-medium p-4 bg-white rounded-2xl border border-gray-100">{t("dashboard.customersPage.loading")}</p>
            ) : customers.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-400">{t("dashboard.customersPage.noCustomers")}</p>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[640px]">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                    <th className="py-3 px-5">{t("dashboard.customersPage.customer")}</th>
                                    <th className="py-3 px-5">{t("dashboard.customersPage.contact")}</th>
                                    <th className="py-3 px-5 text-center">{t("dashboard.customersPage.orders")}</th>
                                    <th className="py-3 px-5 text-right">{t("dashboard.customersPage.totalSpent")}</th>
                                    <th className="py-3 px-5">{t("dashboard.customersPage.lastOrder")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {customers.map((c) => (
                                    <tr key={c._id} className="hover:bg-gray-50/50">
                                        <td className="py-3.5 px-5">
                                            <p className="font-semibold text-gray-900">{c.customerName}</p>
                                            <p className="text-xs text-gray-500">{c.customerEmail}</p>
                                        </td>
                                        <td className="py-3.5 px-5 text-xs">
                                            <p className="text-gray-700">{c.phone || "—"}</p>
                                            <p className="text-gray-400 truncate max-w-[180px]">{c.shippingAddress || ""}</p>
                                        </td>
                                        <td className="py-3.5 px-5 text-center">
                                            <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-50 text-orange-700">{c.totalOrders}</span>
                                        </td>
                                        <td className="py-3.5 px-5 text-right font-semibold text-gray-900">৳{c.totalSpent.toFixed(2)}</td>
                                        <td className="py-3.5 px-5 text-xs text-gray-500">{formatDate(c.lastOrderAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pages > 1 && (
                        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-xs">
                            <span className="text-gray-500">Page {page} of {pages} · {total} {t("dashboard.customersPage.totalCustomers")}</span>
                            <div className="flex gap-1">
                                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-50">Prev</button>
                                {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
                                    let p: number;
                                    if (pages <= 5) p = i + 1;
                                    else if (page <= 3) p = i + 1;
                                    else if (page >= pages - 2) p = pages - 4 + i;
                                    else p = page - 2 + i;
                                    return (
                                        <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 rounded-lg font-semibold ${page === p ? "bg-orange-600 text-white" : "border border-gray-200 hover:bg-gray-50"}`}>{p}</button>
                                    );
                                })}
                                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-50">Next</button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}