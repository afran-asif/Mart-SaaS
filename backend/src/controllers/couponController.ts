import { Response } from "express";
import { Coupon } from "../models/Coupon";
import { Store } from "../models/Store";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { TenantRequest } from "../middlewares/tenantMiddleware";
import { requirePro } from "../utils/plan";

const getVendorStore = async (vendorId: string) => Store.findOne({ vendorId });

export const getCoupons = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const store = await getVendorStore(req.user._id.toString());
        if (!store) { res.status(404).json({ message: "Store not found." }); return; }
        const coupons = await Coupon.find({ storeId: store._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, coupons });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createCoupon = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const store = await getVendorStore(req.user._id.toString());
        if (!store) { res.status(404).json({ message: "Store not found." }); return; }
        if (!requirePro(store, res, "Coupons")) return;
        const { code, discountType, discountValue, minOrderAmount, maxUses, expiresAt, isActive } = req.body;
        const cleanCode = (code || "").toString().trim().toUpperCase();
        if (!cleanCode) { res.status(400).json({ message: "Coupon code is required." }); return; }
        if (!["percent", "fixed"].includes(discountType)) { res.status(400).json({ message: "Invalid discount type." }); return; }
        const val = Number(discountValue);
        if (isNaN(val) || val <= 0) { res.status(400).json({ message: "Discount value must be > 0." }); return; }
        if (discountType === "percent" && val > 100) { res.status(400).json({ message: "Percent discount cannot exceed 100." }); return; }

        const exists = await Coupon.findOne({ storeId: store._id, code: cleanCode });
        if (exists) { res.status(400).json({ message: "Coupon code already exists." }); return; }

        const coupon = await Coupon.create({
            vendorId: req.user._id,
            storeId: store._id,
            code: cleanCode,
            discountType,
            discountValue: val,
            minOrderAmount: Number(minOrderAmount) || 0,
            maxUses: maxUses ? Number(maxUses) : null,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            isActive: isActive !== undefined ? !!isActive : true,
        });
        res.status(201).json({ success: true, coupon });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCoupon = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const store = await getVendorStore(req.user._id.toString());
        if (!store) { res.status(404).json({ message: "Store not found." }); return; }
        const { id } = req.params;
        const coupon = await Coupon.findOne({ _id: id, storeId: store._id });
        if (!coupon) { res.status(404).json({ message: "Coupon not found." }); return; }

        const { code, discountType, discountValue, minOrderAmount, maxUses, expiresAt, isActive } = req.body;
        if (code !== undefined) {
            const clean = code.toString().trim().toUpperCase();
            if (!clean) { res.status(400).json({ message: "Code cannot be empty." }); return; }
            const dup = await Coupon.findOne({ storeId: store._id, code: clean, _id: { $ne: id } });
            if (dup) { res.status(400).json({ message: "Coupon code already exists." }); return; }
            coupon.code = clean;
        }
        if (discountType !== undefined) {
            if (!["percent", "fixed"].includes(discountType)) { res.status(400).json({ message: "Invalid discount type." }); return; }
            coupon.discountType = discountType;
        }
        if (discountValue !== undefined) {
            const v = Number(discountValue);
            if (isNaN(v) || v <= 0) { res.status(400).json({ message: "Invalid discount value." }); return; }
            const type = (discountType as string) || coupon.discountType;
            if (type === "percent" && v > 100) { res.status(400).json({ message: "Percent cannot exceed 100." }); return; }
            coupon.discountValue = v;
        }
        if (minOrderAmount !== undefined) coupon.minOrderAmount = Number(minOrderAmount) || 0;
        if (maxUses !== undefined) coupon.maxUses = maxUses ? Number(maxUses) : null;
        if (expiresAt !== undefined) coupon.expiresAt = expiresAt ? new Date(expiresAt) : null;
        if (isActive !== undefined) coupon.isActive = !!isActive;

        await coupon.save();
        res.status(200).json({ success: true, coupon });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteCoupon = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const store = await getVendorStore(req.user._id.toString());
        if (!store) { res.status(404).json({ message: "Store not found." }); return; }
        const coupon = await Coupon.findOneAndDelete({ _id: req.params.id, storeId: store._id });
        if (!coupon) { res.status(404).json({ message: "Coupon not found." }); return; }
        res.status(200).json({ success: true, message: "Coupon deleted." });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

const calcDiscount = (coupon: any, subtotal: number) => {
    if (coupon.discountType === "percent") return Math.min(Math.round(subtotal * coupon.discountValue / 100), subtotal);
    return Math.min(coupon.discountValue, subtotal);
};

export const validateCoupon = async (req: TenantRequest, res: Response): Promise<void> => {
    try {
        const code = ((req.query.code as string) || (req.body as any)?.code || "").toString().trim().toUpperCase();
        const subtotal = Number((req.query.subtotal as string) || (req.body as any)?.subtotal);
        if (!code) { res.status(400).json({ message: "Coupon code is required." }); return; }
        if (!req.storeId) { res.status(400).json({ message: "Store not found." }); return; }
        const coupon = await Coupon.findOne({ storeId: req.storeId, code });
        if (!coupon) { res.status(404).json({ message: "Invalid coupon code." }); return; }
        if (!coupon.isActive) { res.status(400).json({ message: "Coupon is inactive." }); return; }
        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) { res.status(400).json({ message: "Coupon has expired." }); return; }
        if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) { res.status(400).json({ message: "Coupon usage limit reached." }); return; }
        if (!isNaN(subtotal) && subtotal < coupon.minOrderAmount) { res.status(400).json({ message: `Minimum order ৳${coupon.minOrderAmount} required.` }); return; }
        const discount = !isNaN(subtotal) ? calcDiscount(coupon, subtotal) : 0;
        res.status(200).json({ success: true, coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue }, discount, subtotal });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};