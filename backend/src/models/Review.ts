import { Schema, model, Document, Types } from "mongoose";

export interface IReview extends Document {
    vendorId: Types.ObjectId;
    storeId: Types.ObjectId;
    productId: Types.ObjectId;
    customerName: string;
    phone?: string;
    rating: number;
    comment?: string;
    verifiedBuyer: boolean;
    visible: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
    {
        vendorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        customerName: { type: String, required: true, trim: true },
        phone: { type: String, trim: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, trim: true, maxlength: 1000 },
        verifiedBuyer: { type: Boolean, default: false },
        visible: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// এক phone থেকে এক product-এ একটাই review
reviewSchema.index({ storeId: 1, productId: 1, phone: 1 }, { unique: true, sparse: true });
reviewSchema.index({ storeId: 1, productId: 1, visible: 1, createdAt: -1 });

export const Review = model<IReview>("Review", reviewSchema);
