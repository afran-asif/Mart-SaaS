import mongoose, { Schema, Document, Types } from "mongoose";

export interface IOrder extends Document {
    vendorId: Types.ObjectId;
    storeId: Types.ObjectId;
    customerName: string;
    customerEmail: string;
    phone?: string;
    shippingAddress: string;
    shippingDistrict?: string;
    deliveryCharge?: number;
    orderHost?: string;
    totalAmount: number;
    status: "Pending" | "Processing" | "Delivered" | "Cancelled";
    paymentStatus: "Unpaid" | "Paid" | "Failed" | "Cancelled";
    paymentMethod: "COD" | "SSLCommerz";
    transactionId?: string;
    couponCode?: string | null;
    discountAmount?: number;
    items: Array<{
        product: Types.ObjectId | { _id: Types.ObjectId; name: string };
        quantity: number;
        price: number;
    }>;
    emailSent?: boolean;
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
        shippingDistrict: { type: String, trim: true },
        deliveryCharge: { type: Number, default: 0, min: 0 },
        orderHost: { type: String, trim: true },
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
        paymentStatus: {
            type: String,
            enum: ["Unpaid", "Paid", "Failed", "Cancelled"],
            default: "Unpaid",
        },
        paymentMethod: {
            type: String,
            enum: ["COD", "SSLCommerz"],
            default: "COD",
        },
        transactionId: {
            type: String,
            default: null,
        },
        couponCode: { type: String, default: null, trim: true, uppercase: true },
        discountAmount: { type: Number, default: 0, min: 0 },
        emailSent: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);