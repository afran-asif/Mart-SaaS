import { Schema, model, Document, Types } from "mongoose";

export interface IStore extends Document {
    vendorId: Types.ObjectId;
    storeName: string;
    subdomain: string;
    logo?: string;
    status: 'active' | 'suspended';
    useOwnSSLCommerz: boolean;
    sslcommerzStoreId?: string;
    sslcommerzStorePassword?: string;
    createdAt: Date;
    updatedAt: Date;
}

const storeSchema = new Schema<IStore>(
    {
        vendorId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        storeName: {
            type: String,
            required: true,
            trim: true
        },
        subdomain: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate: {
                validator: function (value: string) {
                    return /^[a-zA-Z0-9-]+$/.test(value);
                },
                message: 'Subdomain must contain only alphanumeric characters and hyphens'
            }
        },
        logo: {
            type: String,
            default: null
        },
        status: {
            type: String,
            enum: ['active','suspended'],
            default: 'active'
        },
        useOwnSSLCommerz: {
            type: Boolean,
            default: false
        },
        sslcommerzStoreId: {
            type: String,
        },
        sslcommerzStorePassword: {
            type: String,
            select: false
        },
    },
    { timestamps: true }
);


export const Store = model<IStore>('Store', storeSchema);