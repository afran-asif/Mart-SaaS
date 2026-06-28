"use client"

import React,{ useState } from "react"
import { registerVendor } from "@/services/authService";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        storeName: "",
        subdomain: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try{
            const data = await registerVendor(formData);
            if (data.success) {
                setMessage("Registration Successful! Welcome aboard.");
            }
        } catch (error: any) {
            setMessage(error.response?.data?.message || "Something went wrong!")
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg">
            <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
                Create Vendor Account 🚀
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
                Build your own store powered by MART-SAAS
            </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4 rounded-md shadow-sm">
                <div>
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <input
                    name="name"
                    type="text"
                    required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                />
                </div>

                <div>
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <input
                    name="email"
                    type="email"
                    required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="vendor@sestone.com"
                    value={formData.email}
                    onChange={handleChange}
                />
                </div>

                <div>
                <label className="text-sm font-medium text-gray-700">Password</label>
                <input
                    name="password"
                    type="password"
                    required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                />
                </div>

                <div>
                <label className="text-sm font-medium text-gray-700">Store Name</label>
                <input
                    name="storeName"
                    type="text"
                    required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="Sestone Premium Gym"
                    value={formData.storeName}
                    onChange={handleChange}
                />
                </div>

                <div>
                <label className="text-sm font-medium text-gray-700">Desired Subdomain</label>
                <div className="mt-1 flex rounded-lg shadow-sm">
                    <input
                    name="subdomain"
                    type="text"
                    required
                    className="w-full rounded-l-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="af-gadgets-2"
                    value={formData.subdomain}
                    onChange={handleChange}
                    />
                    <span className="inline-flex items-center rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                    .martsaas.com
                    </span>
                </div>
                </div>
            </div>

            <div>
                <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-orange-400"
                >
                {loading ? "Creating Account..." : "Register Store"}
                </button>
            </div>

            {message && (
                <p className="mt-2 text-center text-sm font-medium text-gray-700">
                {message}
                </p>
            )}
            </form>
        </div>
        </div>
    );
    }