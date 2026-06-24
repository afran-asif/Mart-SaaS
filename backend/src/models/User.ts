import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: string;
    isActive: boolean;
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
        role: {
            type: String,
            enum: ['super-admin', 'vendor', 'customer'],
            default: 'vendor'
        },
        isActive: {
            type: Boolean,
            default: true
        }

    },
    { timestamps: true }
);

export const User = model<IUser>('User', userSchema);