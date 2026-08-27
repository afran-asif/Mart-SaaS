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
}

export default function SettingsPage() {
    const [store, setStore] = useState<StoreData | null>(null);
    const [storeName, setStoreName] = useState("");
    const [logo, setLogo] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const res = await api.get("/store/config");
                setStore(res.data.store);
                setStoreName(res.data.store.storeName);
                setLogo(res.data.store.logo || "");
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
            const res = await api.put("/store/config", {
                storeName,
                logo,
            });
            setStore(res.data.store);
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

            {/* Read-only info */}
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