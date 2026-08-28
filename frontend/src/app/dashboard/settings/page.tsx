"use client";

import { useState, useEffect } from "react";
import { api } from "@/services/api";
import toast from "react-hot-toast";

interface StoreData {
    id: string;
    storeName: string;
    subdomain: string;
    logo: string | null;
    status: string;
    useOwnSSLCommerz: boolean;
    sslcommerzStoreId?: string;
}

export default function SettingsPage() {
    const [store, setStore] = useState<StoreData | null>(null);
    const [storeName, setStoreName] = useState("");
    const [logo, setLogo] = useState("");
    const [useOwnSSLCommerz, setUseOwnSSLCommerz] = useState(false);
    const [sslcommerzStoreId, setSslcommerzStoreId] = useState("");
    const [sslcommerzStorePassword, setSslcommerzStorePassword] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const res = await api.get("/store/config");
                const data = res.data.store;
                setStore(data);
                setStoreName(data.storeName);
                setLogo(data.logo || "");
                setUseOwnSSLCommerz(data.useOwnSSLCommerz || false);
                setSslcommerzStoreId(data.sslcommerzStoreId || "");
            } catch (error: any) {
                toast.error(error.message || "স্টোরের তথ্য লোড করা যায়নি");
            } finally {
                setLoading(false);
            }
        };
        fetchStore();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload: any = {
                storeName,
                logo,
                useOwnSSLCommerz,
            };

            // পাসওয়ার্ড শুধু তখনই পাঠানো, যখন vendor নতুন করে কিছু লিখেছে
            // (খালি রাখলে existing encrypted password অপরিবর্তিত থাকবে)
            if (useOwnSSLCommerz) {
                if (sslcommerzStoreId) payload.sslcommerzStoreId = sslcommerzStoreId;
                if (sslcommerzStorePassword) payload.sslcommerzStorePassword = sslcommerzStorePassword;
            }

            const res = await api.put("/store/config", payload);
            setStore(res.data.store);
            setSslcommerzStorePassword(""); // সেভ করার পর password field খালি করে দাও (নিরাপত্তার জন্য)
            toast.success("স্টোর তথ্য আপডেট হয়েছে");
        } catch (error: any) {
            toast.error(error.message || "আপডেট করা যায়নি");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-gray-500">লোড হচ্ছে...</div>;
    }

    if (!store) {
        return <div className="p-6 text-red-600">স্টোর খুঁজে পাওয়া যায়নি</div>;
    }

    return (
        <div className="max-w-xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-1">স্টোর সেটিংস</h1>
            <p className="text-sm text-gray-500 mb-6">
                আপনার দোকানের তথ্য এখান থেকে পরিবর্তন করুন
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
                <p className="text-gray-500">
                    সাবডোমেইন: <span className="font-mono text-gray-800">{store.subdomain}.vendoo.shop</span>
                </p>
                <p className="text-gray-500 mt-1">
                    স্ট্যাটাস: <span className="capitalize">{store.status}</span>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1.5">দোকানের নাম</label>
                    <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1.5">লোগো URL</label>
                    <input
                        type="text"
                        value={logo}
                        onChange={(e) => setLogo(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 text-sm"
                    />
                </div>

                {/* --- Hybrid SSLCommerz সেকশন --- */}
                <div className="border-t border-gray-200 pt-4 mt-2">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-sm font-medium">নিজস্ব SSLCommerz অ্যাকাউন্ট ব্যবহার করুন</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                টাকা সরাসরি আপনার নিজের অ্যাকাউন্টে জমা হবে
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setUseOwnSSLCommerz(!useOwnSSLCommerz)}
                            className={`relative w-11 h-6 rounded-full transition-colors ${
                                useOwnSSLCommerz ? "bg-green-700" : "bg-gray-300"
                            }`}
                        >
                            <span
                                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                    useOwnSSLCommerz ? "translate-x-5" : "translate-x-0.5"
                                }`}
                            />
                        </button>
                    </div>

                    {useOwnSSLCommerz && (
                        <div className="flex flex-col gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-xs text-yellow-800">
                                ⚠️ এটার জন্য আপনার একটা বৈধ SSLCommerz merchant অ্যাকাউন্ট (ট্রেড লাইসেন্স-সহ) থাকতে হবে।
                            </p>

                            <div>
                                <label className="block text-xs font-medium mb-1">SSLCommerz Store ID</label>
                                <input
                                    type="text"
                                    value={sslcommerzStoreId}
                                    onChange={(e) => setSslcommerzStoreId(e.target.value)}
                                    placeholder="আপনার Store ID"
                                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium mb-1">SSLCommerz Store Password</label>
                                <input
                                    type="password"
                                    value={sslcommerzStorePassword}
                                    onChange={(e) => setSslcommerzStorePassword(e.target.value)}
                                    placeholder={store.sslcommerzStoreId ? "পরিবর্তন করতে না চাইলে খালি রাখুন" : "আপনার Store Password"}
                                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                                />
                            </div>
                        </div>
                    )}
                </div>
                {/* --- Hybrid SSLCommerz সেকশন শেষ --- */}

                <button
                    type="submit"
                    disabled={saving}
                    className="mt-2 py-3 rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors disabled:opacity-60"
                >
                    {saving ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তন সংরক্ষণ করুন"}
                </button>
            </form>
        </div>
    );
}