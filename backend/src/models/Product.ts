import { Schema, model, Document, Types } from "mongoose";

export interface IProduct extends Document {
    vendorId: Types.ObjectId;
    storeId: Types.ObjectId;
    name: string;
    price: number;
    description: string;
    images: string[];
    stock: number;
    createdAt: Date;
    updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
    {
        vendorId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Vendor ID is required'],
        },
        storeId:{
            type: Schema.Types.ObjectId,
            ref: 'Store',
            required: [true, 'Store ID is required'],
        },
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Product price is required'],
            min: [0, 'Price cannot be negative'],
        },
        description: {
            type: String,
            required: [true, 'Product description is required'],
        },
        images: {
            type: [String],
            default: [],
        },
        stock: {
            type: Number,
            required: [true, 'Product stock quantity is required'],
            min: [0, 'Stock cannot be negative'],
            default: 0,
        },
    },
    {
        timestamps: true,
    }
)

export const Product = model<IProduct>('Product', productSchema);