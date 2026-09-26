import { Schema, model, Document } from "mongoose";

export interface IPlan extends Document {
    slug: "free" | "pro";
    name: string;
    priceMonthly: number;
    maxProducts: number | null; // null = unlimited
    maxOrdersPerMonth: number | null; // null = unlimited
    themes: string[]; // খালি array = সব theme
    customDomain: boolean;
    coupons: boolean;
    pixels: boolean;
    ownGateway: boolean;
    transactionFeePercent: number;
    badgeRequired: boolean;
}

const planSchema = new Schema<IPlan>(
    {
        slug: { type: String, enum: ["free", "pro"], unique: true, required: true },
        name: { type: String, required: true },
        priceMonthly: { type: Number, required: true, default: 0 },
        maxProducts: { type: Number, default: null },
        maxOrdersPerMonth: { type: Number, default: null },
        themes: { type: [String], default: [] },
        customDomain: { type: Boolean, default: false },
        coupons: { type: Boolean, default: false },
        pixels: { type: Boolean, default: false },
        ownGateway: { type: Boolean, default: false },
        transactionFeePercent: { type: Number, default: 0 },
        badgeRequired: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const Plan = model<IPlan>("Plan", planSchema);

// Default plan definitions — seed + fallback দুই জায়গায়ই ব্যবহার হয়
export const DEFAULT_PLANS = [
    {
        slug: "free",
        name: "Free",
        priceMonthly: 0,
        maxProducts: 20,
        maxOrdersPerMonth: null,
        themes: ["classic", "minimal", "vibrant"],
        customDomain: false,
        coupons: false,
        pixels: false,
        ownGateway: false,
        transactionFeePercent: 2,
        badgeRequired: true,
    },
    {
        slug: "pro",
        name: "Pro",
        priceMonthly: 499,
        maxProducts: null,
        maxOrdersPerMonth: null,
        themes: ["classic", "minimal", "bold", "elegant", "vibrant", "retro", "luxe", "pastel", "urban"],
        customDomain: true,
        coupons: true,
        pixels: true,
        ownGateway: true,
        transactionFeePercent: 0,
        badgeRequired: false,
    },
] as const;

export const seedPlans = async (): Promise<void> => {
    for (const p of DEFAULT_PLANS) {
        await Plan.updateOne({ slug: p.slug }, { $setOnInsert: p }, { upsert: true });
    }
};