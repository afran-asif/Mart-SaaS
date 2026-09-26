import { Schema, model, Document, Types } from "mongoose";

export interface ISubscription extends Document {
    vendorId: Types.ObjectId;
    storeId: Types.ObjectId;
    plan: string;
    status: "pending" | "active" | "rejected" | "expired" | "cancelled";
    amount: number;
    trxId?: string;
    senderNumber?: string;
    adminNote?: string;
    periodStart?: Date;
    periodEnd?: Date;
    reviewedBy?: Types.ObjectId;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
    {
        vendorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
        plan: { type: String, required: true, default: "pro" },
        status: {
            type: String,
            enum: ["pending", "active", "rejected", "expired", "cancelled"],
            default: "pending",
        },
        amount: { type: Number, required: true, default: 0 },
        trxId: { type: String, trim: true },
        senderNumber: { type: String, trim: true },
        adminNote: { type: String, trim: true },
        periodStart: { type: Date },
        periodEnd: { type: Date },
        reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
        reviewedAt: { type: Date },
    },
    { timestamps: true }
);

subscriptionSchema.index({ storeId: 1, status: 1 });

export const Subscription = model<ISubscription>("Subscription", subscriptionSchema);