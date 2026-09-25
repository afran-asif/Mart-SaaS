import { Schema, model, Document, Types } from "mongoose";

export interface ICoupon extends Document {
    vendorId: Types.ObjectId;
    storeId: Types.ObjectId;
    code: string;
    discountType: "percent" | "fixed";
    discountValue: number;
    minOrderAmount: number;
    maxUses: number | null;
    usedCount: number;
    expiresAt: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
    {
        vendorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
        code: { type: String, required: true, trim: true, uppercase: true },
        discountType: { type: String, enum: ["percent", "fixed"], required: true },
        discountValue: { type: Number, required: true, min: 0 },
        minOrderAmount: { type: Number, default: 0, min: 0 },
        maxUses: { type: Number, default: null },
        usedCount: { type: Number, default: 0, min: 0 },
        expiresAt: { type: Date, default: null },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

couponSchema.index({ storeId: 1, code: 1 }, { unique: true });

export const Coupon = model<ICoupon>("Coupon", couponSchema);