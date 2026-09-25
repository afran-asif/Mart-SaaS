import { Schema, model, Document, Types } from "mongoose";

export interface ICategory extends Document {
    vendorId: Types.ObjectId;
    storeId: Types.ObjectId;
    name: string;
    createdAt: Date;
}

const categorySchema = new Schema<ICategory>(
    {
        vendorId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Vendor ID is required'],
        },
        storeId: {
            type: Schema.Types.ObjectId,
            ref: 'Store',
            required: [true, 'Store ID is required'],
        },
        name: {
            type: String,
            required: [true, 'Category name is required'],
            trim: true,
        },
    },
    { timestamps: true }
);

export const Category = model<ICategory>('Category', categorySchema);