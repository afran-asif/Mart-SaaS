import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: string;
    phone: string | null;
    avatar: string | null;
    isActive: boolean;
    isVerified: boolean;
    verificationToken: string | null;
    verificationTokenExpires: Date | null;
    resetPasswordToken: string | null;
    resetPasswordExpires: Date | null;
    createdAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Please add a name"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "Please add an email"],
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, "Please add a password"],
            trim: true
        },
        phone: {
            type: String,
            default: null,
            trim: true,
        },
        role: {
            type: String,
            enum: ['super-admin', 'vendor', 'customer'],
            default: 'vendor'
        },
        avatar: {
            type: String,
            default: null,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        verificationToken: {
            type: String,
            default: null
        },
        verificationTokenExpires: {
            type: Date,
            default: null
        },
        resetPasswordToken: {
            type: String,
            default: null
        },
        resetPasswordExpires: {
            type: Date,
            default: null
        }

    },
    { timestamps: true }
);

// partial unique — শুধু real phone string index হয়, null/missing skip (E11000-safe)
userSchema.index({ phone: 1 }, { unique: true, partialFilterExpression: { phone: { $type: "string" } } });

export const User = model<IUser>('User', userSchema);