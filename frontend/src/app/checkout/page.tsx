// src/app/checkout/page.tsx
"use client";

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { createOrder } from "@/services/orderService";
import { clearCart, removeFromCart } from "@/redux/cartSlice";

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items, totalAmount } = useSelector(
    (state: any) => state.cart || { items: [], totalAmount: 0 }
  );
  const { store } = useSelector((state: any) => state.auth);

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    shippingAddress: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName || !formData.customerEmail || !formData.shippingAddress) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!items || items.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        shippingAddress: formData.shippingAddress,
        phone: formData.phone,
        totalAmount: totalAmount || 0,
        storeId: store?.id || store?._id || "",
        items: items.map((item: any) => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      await createOrder(orderPayload);
      dispatch(clearCart());
      toast.success("🎉 Order placed successfully!");
      router.push("/dashboard/orders");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  const displayTotal = totalAmount || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Checkout</h1>
          <p className="text-gray-400 text-sm mt-1">Complete your order below.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* ─── Left: Shipping Form ─── */}
          <form
            onSubmit={handlePlaceOrder}
            className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6"
          >
            <div>
              <h2 className="text-lg font-bold text-gray-800">Shipping Information</h2>
              <p className="text-xs text-gray-400 mt-0.5">Fields marked * are required</p>
            </div>

            <hr className="border-gray-100" />

            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="customerName"
                  required
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="e.g. Asib Hossain"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  required
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  placeholder="e.g. asib@example.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+8801700000000"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Shipping Address *
              </label>
              <textarea
                name="shippingAddress"
                required
                rows={3}
                value={formData.shippingAddress}
                onChange={handleInputChange}
                placeholder="House #, Road, Area, City, ZIP"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all resize-none"
              />
            </div>

            {/* Payment notice */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-700 font-medium flex gap-3 items-start">
              <span className="text-lg">💳</span>
              <p>
                Payment is done on delivery (Cash on Delivery). No online payment required at this step.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-200 disabled:bg-gray-300 disabled:shadow-none text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                `✅ Confirm & Place Order — $${displayTotal.toFixed(2)}`
              )}
            </button>
          </form>

          {/* ─── Right: Order Summary ─── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="text-base font-bold text-gray-800">Order Summary</h2>
              <hr className="border-gray-100" />

              {/* Items list */}
              {items && items.length > 0 ? (
                <div className="space-y-3">
                  {items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-sm shrink-0">
                          📦
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-800 leading-tight">
                            {item.name || "Product"}
                          </p>
                          <p className="text-[11px] text-gray-400">× {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-gray-900 shrink-0">
                        ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">No items in cart</p>
              )}

              <hr className="border-gray-100" />

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">${displayTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <hr className="border-gray-100" />
                <div className="flex justify-between text-base font-extrabold text-gray-900">
                  <span>Total</span>
                  <span className="text-orange-500">${displayTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Security badge */}
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 text-center text-xs text-gray-400 font-medium">
              🔒 Your information is safe & encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}