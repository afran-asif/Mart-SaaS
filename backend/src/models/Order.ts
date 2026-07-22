import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
    customerName: string;
    customerEmail: string;
    shippingAddress: string;
    totalAmount: number;
    status: "Pending" | "Processing" | "Delivered" | "Cancelled";
    items: Array<{
        product: mongoose.Types.ObjectId;
        quantity: number;
        price: number;
    }>;
}

const OrderSchema: Schema = new Schema(
    {
        customerName: { type: String, required: true },
        customerEmail: { type: String, required: true },
        shippingAddress: { type: String, required: true },
        totalAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ["Pending", "Processing", "Delivered", "Cancelled"],
            default: "Pending",
        },
        items: [
            {
                product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);