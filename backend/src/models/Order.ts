import mongoose, { Schema, Document, Types } from "mongoose";

export interface IOrder extends Document {
    vendorId: Types.ObjectId;
    storeId: Types.ObjectId;
    customerName: string;
    customerEmail: string;
    phone?: string;
    shippingAddress: string;
    totalAmount: number;
    status: "Pending" | "Processing" | "Delivered" | "Cancelled";
    items: Array<{
        product: Types.ObjectId;
        quantity: number;
        price: number;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
    {
        vendorId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Vendor ID is required"],
        },
        storeId: {
            type: Schema.Types.ObjectId,
            ref: "Store",
            required: [true, "Store ID is required"],
        },
        customerName: { type: String, required: true, trim: true },
        customerEmail: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, trim: true },
        shippingAddress: { type: String, required: true },
        totalAmount: { type: Number, required: true, min: 0 },
        status: {
            type: String,
            enum: ["Pending", "Processing", "Delivered", "Cancelled"],
            default: "Pending",
        },
        items: [
            {
                product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
                quantity: { type: Number, required: true, min: 1 },
                price: { type: Number, required: true, min: 0 },
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);