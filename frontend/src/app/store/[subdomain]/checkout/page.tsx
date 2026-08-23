"use client";

import { useState, useEffect , useRef} from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { clearCart } from "@/redux/cartSlice";
import { api } from "@/services/api";
import toast from "react-hot-toast";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";

export default function CheckoutPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { items, totalAmount, hydrated } = useSelector((state: RootState) => state.cart);

    const [storeId, setStoreId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const orderPlacedRef = useRef(false);   // ✅ নতুন flag
    const [form, setForm] = useState({
        customerName: "",
        customerEmail: "",
        phone: "",
        shippingAddress: "",
    });
    const [ paymentMethod, setPaymentMethod] = useState<"COD" | "SSLCommerz">("COD");

    // পেজ লোড হওয়ার সাথে সাথে বর্তমান store এর _id ফেচ করা
    useEffect(() => {
        const fetchStoreId = async () => {
            try {
                const res = await api.get("/tenant/store");
                setStoreId(res.data.store.id);
            } catch {
                toast.error("স্টোরের তথ্য লোড করা যায়নি");
            }
        };
        fetchStoreId();
    }, []);

    // কার্ট খালি থাকলে হোমপেজে ফেরত পাঠানো
    useEffect(() => {
        if (hydrated && items.length === 0&& !orderPlacedRef.current) {
            router.replace("/");
        }
    }, [hydrated, items, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!storeId) {
            toast.error("স্টোরের তথ্য এখনো লোড হয়নি, আবার চেষ্টা করুন");
            return;
        }

        setLoading(true);
        try {
            const orderItems = items.map((item) => ({
                product: item._id,
                quantity: item.quantity,
                price: item.price,
            }));

            const res = await api.post("/payment/initiate", {
                ...form,
                storeId,
                items: orderItems,
                totalAmount,
                paymentMethod,
            });
            if (res.data.success) {
                orderPlacedRef.current = true;   // redirect guard বন্ধ করা, cart clear হলেও যেন হোমে না পাঠায়
                dispatch(clearCart());
                
                if (res.data.paymentMethod === "COD") {
                    toast.success("অর্ডার সফলভাবে সম্পন্ন হয়েছে!");
                    router.push(`/order-confirmed?orderId=${res.data.orderId}`);
                } else if (res.data.paymentUrl) {
                    // ✅ SSLCommerz payment page এ পাঠিয়ে দেওয়া
                window.location.href = res.data.paymentUrl;
                }
            } else {
                toast.error("পেমেন্ট শুরু করা যায়নি");
            }
        } catch (error: any) {
            toast.error(error.message || "অর্ডার করতে সমস্যা হয়েছে");
        } finally {
            setLoading(false);
        }
    };
    // রেন্ডার গার্ডও আপডেট করো
    if (!hydrated) {
        return (
            <div className="min-h-screen bg-[#F6F3EC] flex items-center justify-center">
                <p className="text-[#8B8F82] text-sm">লোড হচ্ছে...</p>
            </div>
        );
    }

    if (items.length === 0) return null;

    return (
        <div className="min-h-screen bg-[#F6F3EC]">
            <StorefrontHeader variant="sub" />

            <main className="max-w-2xl mx-auto px-6 py-10">
                <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-[#1B1E19] mb-1">
                    চেকআউট
                </h1>
                <p className="font-['IBM_Plex_Mono'] text-xs tracking-widest uppercase text-[#8B8F82] mb-8">
                    ডেলিভারি তথ্য পূরণ করুন
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[#1B1E19] mb-1.5">
                            পুরো নাম
                        </label>
                        <input
                            type="text"
                            name="customerName"
                            required
                            value={form.customerName}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-[#1B1E19]/15 bg-white focus:outline-none focus:ring-2 focus:ring-[#274B3B] text-sm"
                            placeholder="আপনার নাম লিখুন"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#1B1E19] mb-1.5">
                            ইমেইল
                        </label>
                        <input
                            type="email"
                            name="customerEmail"
                            required
                            value={form.customerEmail}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-[#1B1E19]/15 bg-white focus:outline-none focus:ring-2 focus:ring-[#274B3B] text-sm"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#1B1E19] mb-1.5">
                            ফোন নম্বর
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            required
                            value={form.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-[#1B1E19]/15 bg-white focus:outline-none focus:ring-2 focus:ring-[#274B3B] text-sm"
                            placeholder="01XXXXXXXXX"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#1B1E19] mb-1.5">
                            ডেলিভারি ঠিকানা
                        </label>
                        <textarea
                            name="shippingAddress"
                            required
                            rows={3}
                            value={form.shippingAddress}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-[#1B1E19]/15 bg-white focus:outline-none focus:ring-2 focus:ring-[#274B3B] text-sm resize-none"
                            placeholder="বাসা/রোড/এলাকা/শহর"
                        />
                    </div>

                    {/* অর্ডার সারাংশ */}
                    <div className="bg-white rounded-lg border border-[#1B1E19]/8 p-4 mt-2">
                        <div className="flex justify-between text-sm text-[#1B1E19]/80 mb-2">
                            <span>{items.length} টি প্রোডাক্ট</span>
                            <span className="font-['IBM_Plex_Mono']">৳{totalAmount}</span>
                        </div>
                        <div className="flex justify-between font-medium text-[#1B1E19] pt-2 border-t border-[#1B1E19]/10">
                            <span>মোট</span>
                            <span className="font-['IBM_Plex_Mono']">৳{totalAmount}</span>
                        </div>
                    </div>
                    {/* Payment Method নির্বাচন */}
                    <div>
                        <label className="block text-sm font-medium text-[#1B1E19] mb-2">
                            পেমেন্ট মাধ্যম
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("COD")}
                                className={`py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
                                    paymentMethod === "COD"
                                        ? "border-[#274B3B] bg-[#274B3B]/5 text-[#274B3B]"
                                        : "border-[#1B1E19]/15 text-[#8B8F82] hover:border-[#1B1E19]/30"
                                }`}
                            >
                                ক্যাশ অন ডেলিভারি
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("SSLCommerz")}
                                className={`py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
                                    paymentMethod === "SSLCommerz"
                                        ? "border-[#274B3B] bg-[#274B3B]/5 text-[#274B3B]"
                                        : "border-[#1B1E19]/15 text-[#8B8F82] hover:border-[#1B1E19]/30"
                                }`}
                            >
                                bKash / Nagad / Card
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-3.5 rounded-lg font-medium text-sm bg-[#274B3B] text-[#F6F3EC] hover:bg-[#1F3D2F] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? "অর্ডার হচ্ছে..." : "অর্ডার কনফার্ম করুন"}
                    </button>
                </form>
            </main>
        </div>
    );
}