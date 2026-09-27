import { Schema, model, Document, Types } from "mongoose";

export interface IImpersonationLog extends Document {
    adminId: Types.ObjectId;
    vendorId: Types.ObjectId;
    storeId: Types.ObjectId;
    tokenHash: string;
    used: boolean;
    expiresAt: Date;
    sessionStartedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const impersonationLogSchema = new Schema<IImpersonationLog>(
    {
        adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        vendorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
        tokenHash: { type: String, required: true, unique: true },
        used: { type: Boolean, default: false },
        expiresAt: { type: Date, required: true },
        sessionStartedAt: { type: Date },
    },
    { timestamps: true }
);

impersonationLogSchema.index({ storeId: 1, createdAt: -1 });

export const ImpersonationLog = model<IImpersonationLog>("ImpersonationLog", impersonationLogSchema);