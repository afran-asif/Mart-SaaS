"use client";

import { useState, useEffect , useRef} from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { clearCart, clearBuyNow, addToCart, decreaseQuantity, updateBuyNowQuantity } from "@/redux/cartSlice";
import { api } from "@/services/api";
import { trackInitiateCheckout, trackAddToCart } from "@/lib/tracking";
import toast from "react-hot-toast";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";
import { themeBgMap, isDarkTheme, isLuxeTheme } from "@/lib/storeTheme";

export default function CheckoutPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { items, hydrated, buyNowItem, selectedIds } = useSelector((state: RootState) => state.cart);

    // Buy Now flow হলে শুধু সেই item, নইলে cart-এর selected item
    const isBuyNow = !!buyNowItem;
    const cartFlowItems = selectedIds === null ? items : items.filter((item) => selectedIds.includes(item._id));
    const checkoutItems = isBuyNow
        ? [buyNowItem!]
        : cartFlowItems;
    const checkoutTotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const [storeId, setStoreId] = useState<string | null>(null);    const [loading, setLoading] = useState(false);
    const [theme, setTheme] = useState("classic");
    const [brand, setBrand] = useState("#F4501A");
    const orderPlacedRef = useRef(false);   // ✅ নতুন flag
    const initiatedRef = useRef(false);
    const [form, setForm] = useState({
        customerName: "",
        customerEmail: "",
        phone: "",
        shippingAddress: "",
    });
    const [ paymentMethod, setPaymentMethod] = useState<"COD" | "SSLCommerz">("COD");
    const [couponCode, setCouponCode] = useState("");
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponApplied, setCouponApplied] = useState<string | null>(null);
    const [couponError, setCouponError] = useState("");
    const [couponLoading, setCouponLoading] = useState(false);

    // E-commerce tracking: InitiateCheckout
    useEffect(() => {
        if (hydrated && checkoutItems.length > 0 && !initiatedRef.current) {
            initiatedRef.current = true;
            trackInitiateCheckout(
                checkoutItems.map((item) => ({
                    id: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                })),
                checkoutTotal
            );
        }
    }, [hydrated, checkoutItems, checkoutTotal]);

    // পেজ লোড হওয়ার সাথে সাথে বর্তমান store এর _id ফেচ করা
    useEffect(() => {
        const fetchStoreId = async () => {
            try {
                const res = await api.get("/tenant/store");
                setStoreId(res.data.store.id);
                setTheme(res.data.store.theme || "classic");
                setBrand(res.data.store.brandColor || "#F4501A");
            } catch {
                toast.error("স্টোরের তথ্য লোড করা যায়নি");
            }
        };
        fetchStoreId();
    }, []);

    // কার্ট বা buyNow খালি থাকলে হোমপেজে ফেরত পাঠানো
    useEffect(() => {
        if (hydrated && checkoutItems.length === 0 && !orderPlacedRef.current) {
            router.replace("/");
        }
    }, [hydrated, checkoutItems, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const discountedTotal = Math.max(checkoutTotal - couponDiscount, 0);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponError("");
        try {
            const res = await api.get("/coupons/validate", { params: { code: couponCode.trim(), subtotal: checkoutTotal } });
            setCouponDiscount(res.data.discount || 0);
            setCouponApplied(couponCode.trim().toUpperCase());
            toast.success(`Coupon applied! ৳${res.data.discount} off`);
        } catch (err: any) {
            setCouponDiscount(0);
            setCouponApplied(null);
            setCouponError(err.message || "Invalid coupon");
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setCouponCode("");
        setCouponDiscount(0);
        setCouponApplied(null);
        setCouponError("");
    };

    // Checkout থেকে quantity বাড়ানো/কমানো (1-এর নিচে নামবে না)
    const handleQtyIncrease = (item: (typeof checkoutItems)[number]) => {
        if (isBuyNow) {
            dispatch(updateBuyNowQuantity(item.quantity + 1));
        } else {
            dispatch(addToCart({ product: item, quantity: 1 }));
            trackAddToCart({ id: item._id, name: item.name, price: item.price }, 1);
        }
    };

    const handleQtyDecrease = (item: (typeof checkoutItems)[number]) => {
        if (isBuyNow) {
            dispatch(updateBuyNowQuantity(item.quantity - 1));
        } else {
            dispatch(decreaseQuantity(item._id));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!storeId) {
            toast.error("স্টোরের তথ্য এখনো লোড হয়নি, আবার চেষ্টা করুন");
            return;
        }

        setLoading(true);
        try {
            const orderItems = checkoutItems.map((item) => ({
                product: item._id,
                quantity: item.quantity,
                price: item.price,
            }));

            const trackingItems = checkoutItems.map((item) => ({
                id: item._id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
            }));

            const res = await api.post("/payment/initiate", {
                ...form,
                storeId,
                items: orderItems,
                totalAmount: discountedTotal,
                paymentMethod,
                couponCode: couponApplied || undefined,
            });
            if (res.data.success) {
                orderPlacedRef.current = true;   // redirect guard বন্ধ করা, cart clear হলেও যেন হোমে না পাঠায়

                // Save order details in sessionStorage for Purchase tracking on order-confirmed
                try {
                    sessionStorage.setItem(
                        "last_order",
                        JSON.stringify({
                            orderId: res.data.orderId,
                            totalAmount: discountedTotal,
                            items: trackingItems,
                        })
                    );
                } catch {}

                // Buy Now হলে buyNow clear করো, নইলে cart clear করো
                if (isBuyNow) {
                    dispatch(clearBuyNow());
                } else {
                    dispatch(clearCart());
                }
                
                    if (res.data.paymentMethod === "COD") {
                    toast.success("অর্ডার সফলভাবে সম্পন্ন হয়েছে!");
                    router.push(`/order-confirmed?orderId=${res.data.orderId}&total=${discountedTotal}`);
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
            <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
                <p className="text-[#75705F] text-sm">লোড হচ্ছে...</p>
            </div>
        );
    }

    if (checkoutItems.length === 0) return null;

    const bg = themeBgMap[theme] || themeBgMap.classic;
    const isDark = isDarkTheme(theme);
    const isLuxe = isLuxeTheme(theme);

    return (
        <div className={`min-h-screen ${bg}`}>
            <StorefrontHeader variant="sub" brandColor={brand} theme={theme} />

            <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                <p className={`font-['IBM_Plex_Mono'] text-[11px] tracking-[0.2em] uppercase mb-2 ${isLuxe ? "text-[#d4af37]" : isDark ? "text-white/60" : "text-[#C6A15B]"}`}>
                    Almost done
                </p>
                <h1 className={`font-['Fraunces',serif] text-3xl sm:text-4xl font-semibold mb-1 tracking-tight ${isLuxe ? "text-[#d4af37]" : isDark ? "text-white" : "text-[#181410]"}`}>
                    চেকআউট
                </h1>
                <p className={`font-['IBM_Plex_Mono'] text-xs tracking-widest uppercase mb-8 ${isDark ? "text-white/50" : "text-[#75705F]"}`}>
                    ডেলিভারি তথ্য পূরণ করুন
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <p className="font-['IBM_Plex_Mono'] text-[11px] tracking-[0.2em] uppercase text-[#75705F] -mb-1">
                        01 — Delivery details
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-[#181410] mb-1.5">
                            পুরো নাম
                        </label>
                        <input
                            type="text"
                            name="customerName"
                            required
                            value={form.customerName}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#181410]/15 bg-white focus:outline-none focus:ring-2 focus:ring-[#F4501A] text-sm"
                            placeholder="আপনার নাম লিখুন"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#181410] mb-1.5">
                            ইমেইল
                        </label>
                        <input
                            type="email"
                            name="customerEmail"
                            required
                            value={form.customerEmail}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#181410]/15 bg-white focus:outline-none focus:ring-2 focus:ring-[#F4501A] text-sm"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#181410] mb-1.5">
                            ফোন নম্বর
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            required
                            value={form.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#181410]/15 bg-white focus:outline-none focus:ring-2 focus:ring-[#F4501A] text-sm"
                            placeholder="01XXXXXXXXX"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#181410] mb-1.5">
                            ডেলিভারি ঠিকানা
                        </label>
                        <textarea
                            name="shippingAddress"
                            required
                            rows={3}
                            value={form.shippingAddress}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#181410]/15 bg-white focus:outline-none focus:ring-2 focus:ring-[#F4501A] text-sm resize-none"
                            placeholder="বাসা/রোড/এলাকা/শহর"
                        />
                    </div>

                    {/* অর্ডার সারাংশ */}
                    <div className="bg-white rounded-2xl border border-[#181410]/10 border-t-2 border-t-[#C6A15B] p-5 mt-2 shadow-[0_16px_40px_-20px_rgba(24,20,16,0.3)]">
                        <p className="font-['IBM_Plex_Mono'] text-[11px] tracking-[0.2em] uppercase text-[#75705F] mb-2">
                            02 — Order summary
                        </p>
                        <h3 className="font-['Fraunces',serif] font-semibold text-lg text-[#181410] mb-3">অর্ডার সারাংশ</h3>

                        {/* Item list with images */}
                        <div className="flex flex-col gap-3 mb-3">
                            {checkoutItems.map((item) => (
                                <div key={item._id} className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-md overflow-hidden bg-[#F4EEE2] flex-shrink-0">
                                        <img
                                            src={item.image || (item.images && item.images[0]) || "/placeholder.png"}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-[#181410] truncate">{item.name}</p>
                                        <div className="flex items-center gap-1 bg-[#F4EEE2] rounded-full p-0.5 mt-1.5 w-fit">
                                            <button
                                                type="button"
                                                onClick={() => handleQtyDecrease(item)}
                                                disabled={item.quantity <= 1}
                                                className="w-6 h-6 rounded-full bg-white border border-[#181410]/10 flex items-center justify-center text-[#181410] text-xs hover:border-[#C6A15B] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[#181410]/10"
                                                aria-label="কমান"
                                            >
                                                −
                                            </button>
                                            <span className="font-['IBM_Plex_Mono'] text-xs w-6 text-center text-[#181410]">
                                                {item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleQtyIncrease(item)}
                                                disabled={item.stock !== undefined && item.quantity >= item.stock}
                                                className="w-6 h-6 rounded-full bg-white border border-[#181410]/10 flex items-center justify-center text-[#181410] text-xs hover:border-[#C6A15B] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[#181410]/10"
                                                aria-label="বাড়ান"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <span className="font-['IBM_Plex_Mono'] text-sm text-[#0E3B2C] flex-shrink-0">
                                        ৳{item.price * item.quantity}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Coupon */}
                        <div className="flex gap-2 mt-3">
                            <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                placeholder="Coupon code"
                                disabled={!!couponApplied}
                                className="flex-1 px-3 py-2 rounded-xl border border-[#181410]/15 text-sm font-mono uppercase disabled:bg-gray-50"
                            />
                            {couponApplied ? (
                                <button type="button" onClick={handleRemoveCoupon} className="px-4 py-2 rounded-xl bg-gray-100 text-sm font-medium">Remove</button>
                            ) : (
                                <button type="button" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()} className="px-4 py-2 rounded-xl bg-[#0E3B2C] text-white text-sm font-medium disabled:opacity-50">
                                    {couponLoading ? "..." : "Apply"}
                                </button>
                            )}
                        </div>
                        {couponError && <p className="text-xs text-red-600 mt-1">{couponError}</p>}
                        {couponApplied && <p className="text-xs text-green-700 mt-1">✓ {couponApplied} applied</p>}

                        <div className="flex flex-col gap-1.5 pt-3 border-t border-[#181410]/10 mt-3 text-sm">
                            <div className="flex justify-between text-[#75705F]">
                                <span>Subtotal</span>
                                <span className="font-['IBM_Plex_Mono']">৳{checkoutTotal}</span>
                            </div>
                            {couponDiscount > 0 && (
                                <div className="flex justify-between text-green-700 font-medium">
                                    <span>Discount ({couponApplied})</span>
                                    <span className="font-['IBM_Plex_Mono']">-৳{couponDiscount}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-[#181410] text-base pt-1 border-t border-[#181410]/10">
                                <span>মোট</span>
                                <span className="font-['IBM_Plex_Mono']">৳{discountedTotal}</span>
                            </div>
                        </div>
                    </div>
                    {/* Payment Method নির্বাচন */}
                    <div>
                        <p className="font-['IBM_Plex_Mono'] text-[11px] tracking-[0.2em] uppercase text-[#75705F] mb-2">
                            03 — Payment
                        </p>
                        <label className="block text-sm font-medium text-[#181410] mb-2">
                            পেমেন্ট মাধ্যম
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("COD")}
                                className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                                    paymentMethod === "COD"
                                        ? "border-[#0E3B2C] bg-[#0E3B2C]/5 text-[#0E3B2C] shadow-sm"
                                        : "border-[#181410]/15 text-[#75705F] hover:border-[#C6A15B]"
                                }`}
                            >
                                ক্যাশ অন ডেলিভারি
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("SSLCommerz")}
                                className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                                    paymentMethod === "SSLCommerz"
                                        ? "border-[#0E3B2C] bg-[#0E3B2C]/5 text-[#0E3B2C] shadow-sm"
                                        : "border-[#181410]/15 text-[#75705F] hover:border-[#C6A15B]"
                                }`}
                            >
                                bKash / Nagad / Card
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-4 rounded-xl font-medium text-sm bg-[#F4501A] text-white hover:bg-[#D63F0F] transition-all shadow-lg shadow-[#F4501A]/25 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? "অর্ডার হচ্ছে..." : "অর্ডার কনফার্ম করুন →"}
                    </button>
                </form>
            </main>
        </div>
    );
}