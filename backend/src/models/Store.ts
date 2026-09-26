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
    facebookPixelId?: string;
    googleAnalyticsId?: string;
    tiktokPixelId?: string;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    whatsappNumber?: string | null;
    brandColor?: string | null;
    heroTitle?: string | null;
    heroSubtitle?: string | null;
    heroImage?: string | null;
    theme?: string;
    customDomain?: string | null;
    customDomainStatus?: "none" | "pending" | "verified" | "failed";
    customDomainVerificationCode?: string | null;
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
        facebookPixelId: {
            type: String,
            default: null,
            trim: true,
        },
        googleAnalyticsId: {
            type: String,
            default: null,
            trim: true,
        },
        tiktokPixelId: {
            type: String,
            default: null,
            trim: true,
        },
        facebookUrl: {
            type: String,
            default: null,
            trim: true,
        },
        instagramUrl: {
            type: String,
            default: null,
            trim: true,
        },
        whatsappNumber: {
            type: String,
            default: null,
            trim: true,
        },
        brandColor: {
            type: String,
            default: null,
            trim: true,
        },
        heroTitle: {
            type: String,
            default: null,
            trim: true,
        },
        heroSubtitle: {
            type: String,
            default: null,
            trim: true,
        },
        heroImage: {
            type: String,
            default: null,
        },
theme: {
            type: String,
            enum: ["classic", "minimal", "bold", "elegant", "vibrant", "retro", "luxe", "pastel", "urban"],
            default: "classic",
        },
        customDomain: {
            type: String,
            default: null,
            trim: true,
            lowercase: true,
            unique: true,
            sparse: true,
        },
        customDomainStatus: {
            type: String,
            enum: ["none", "pending", "verified", "failed"],
            default: "none",
        },
        customDomainVerificationCode: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);


export const Store = model<IStore>('Store', storeSchema);