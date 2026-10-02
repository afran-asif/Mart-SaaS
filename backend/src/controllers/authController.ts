import { Request, Response } from "express";
import { User } from "../models/User";
import { Store } from "../models/Store";
import { Category } from "../models/Category";
import { ImpersonationLog } from "../models/ImpersonationLog";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendVerificationEmail, sendResetPasswordEmail } from "../utils/sendEmail";

const DEFAULT_CATEGORIES = ["Clothing", "Gadgets", "Accessories", "Home & Kitchen", "Beauty & Health"];

const getFrontendUrl = (): string => {
    return (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");
};

const isProdCookie = process.env.NODE_ENV === "production";

const cookieOptions = {
    httpOnly: true,
    // production-এ frontend/backend আলাদা host (cross-site) → SameSite=None + Secure লাগবে,
    // নইলে browser cookie পাঠাবে না। local dev-এ lax।
    secure: isProdCookie,
    sameSite: (isProdCookie ? "none" : "lax") as "none" | "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

const generateToken = (res: Response, userId: string): string => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
        expiresIn: '7d',
    });

    res.cookie('token', token, cookieOptions);

    return token; // ✅ token return করা হচ্ছে
};

export const logoutUser = async (_req: Request, res: Response): Promise<void> => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: isProdCookie,
        sameSite: (isProdCookie ? "none" : "lax") as "none" | "lax",
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// ✏️ Personal info update (name only — email login identity, বদলানো যায় না)
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById((req as any).user._id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const { name } = req.body as { name?: string };
        if (!name?.trim()) {
            res.status(400).json({ message: 'Name is required' });
            return;
        }
        user.name = name.trim().slice(0, 60);
        await user.save();
        res.status(200).json({
            success: true,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// 🔑 Password change (current verify + min 8)
export const changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById((req as any).user._id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
        if (!currentPassword || !newPassword) {
            res.status(400).json({ message: 'Current and new password are required' });
            return;
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Current password is incorrect' });
            return;
        }
        if (newPassword.length < 8) {
            res.status(400).json({ message: 'Password must be at least 8 characters long' });
            return;
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = (req as any).user;
        if (!user) {
            res.status(401).json({ message: 'Not authenticated' });
            return;
        }
        const store = await Store.findOne({ vendorId: user._id }).select("storeName subdomain");
        res.status(200).json({
            success: true,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            store: store ? { id: store._id, storeName: store.storeName, subdomain: store.subdomain } : null,
            impersonatedBy: (req as any).impersonatedBy || null,
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// GET /auth/impersonate/cb/:token — one-time link → vendor session cookie + dashboard redirect
export const impersonateCallback = async (req: Request, res: Response): Promise<void> => {    try {
        const rawToken = (req.params.token as string) || "";
        const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
        const entry = await ImpersonationLog.findOne({
            tokenHash,
            used: false,
            expiresAt: { $gt: new Date() },
        });
        if (!entry) {
            res.status(403).send("This link has expired or was already used.");
            return;
        }
        entry.used = true;
        entry.sessionStartedAt = new Date();
        await entry.save();

        const vendor = await User.findById(entry.vendorId);
        if (!vendor) {
            res.status(404).send("Vendor not found.");
            return;
        }

        const token = jwt.sign(
            { userId: vendor._id.toString(), imp: true, by: entry.adminId.toString() },
            process.env.JWT_SECRET!,
            { expiresIn: "15m" }
        );
        res.cookie("token", token, { ...cookieOptions, maxAge: 15 * 60 * 1000 });

        const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");
        res.redirect(`${frontendUrl}/en/dashboard`);
    } catch (error) {
        res.status(500).send("Impersonation failed.");
    }
};

export const registerVendor = async (req: Request, res: Response) => {
    try {
        const {name, email, password, storeName, subdomain } = req.body;

        if (!password || password.length < 8) {
            res.status(400).json({ message: 'Password must be at least 8 characters long' });
            return;
        }
        
        const userExists = await User.findOne({ email })
        if (userExists) {
            res.status(400).json({ message: 'User already exists with this email' })
            return;
        }
        const subdomainExists = await Store.findOne({ subdomain });
        if(subdomainExists){
            res.status(400).json({ message: 'Subdomain is already taken'})
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'vendor',
            isVerified: false,
            verificationToken,
            verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        const store = await Store.create({
            vendorId: user._id,
            storeName,
            subdomain,
            // 🎁 নতুন স্টোরে ১৪ দিনের Pro trial
            plan: "pro",
            planExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        });

        // 🏷️ নতুন স্টোরের জন্য default categories তৈরি
        await Category.insertMany(
            DEFAULT_CATEGORIES.map((name) => ({ vendorId: user._id, storeId: store._id, name }))
        );

        const verifyUrl = `${getFrontendUrl()}/en/verify-email?token=${verificationToken}`;
        sendVerificationEmail({ to: user.email, name: user.name, verifyUrl });

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please verify your email to activate your account.',
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            store: { id: store._id, storeName: store.storeName, subdomain: store.subdomain }
        });
    }catch(error) {
        res.status(500).json({message: (error as Error).message });
    }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if(!user) {
            res.status(401).json({ message: 'Invalid email or password'});
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            res.status(401).json({ message: 'Invalid email or password'});
            return;
        }

        if (!user.isVerified) {
            // Legacy accounts (created before email verification) had no token set — mark them verified.
            if (!user.verificationToken && !user.verificationTokenExpires) {
                user.isVerified = true;
                await user.save();
            } else {
                res.status(403).json({
                    message: 'Please verify your email first. Check your inbox for the verification link.',
                    needEmailVerification: true,
                });
                return;
            }
        }

        const token = generateToken(res, user._id.toString());

        const store = await Store.findOne({ vendorId: user._id });
        
        res.status(200).json({
            success: true,
            token, // ✅ token response-এ পাঠানো হচ্ছে
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            store: { storeName: store?.storeName, subdomain: store?.subdomain }
        });
    } catch(error) {
        res.status(500).json({ message: (error as Error).message });
    }
}

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: new Date() },
        });

        if (!user) {
            res.status(400).json({ message: 'Invalid or expired verification link' });
            return;
        }

        user.isVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpires = null;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully! You can log in now.',
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const resendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            res.status(200).json({ success: true, message: 'If an account exists with that email, a verification link has been sent.' });
            return;
        }

        if (user.isVerified) {
            res.status(400).json({ message: 'This email is already verified. You can log in.' });
            return;
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = verificationToken;
        user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        const verifyUrl = `${getFrontendUrl()}/en/verify-email?token=${verificationToken}`;
        sendVerificationEmail({ to: user.email, name: user.name, verifyUrl });

        res.status(200).json({ success: true, message: 'Verification email sent again!' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (user) {
            const resetPasswordToken = crypto.randomBytes(32).toString('hex');
            user.resetPasswordToken = resetPasswordToken;
            user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
            await user.save();

            const resetUrl = `${getFrontendUrl()}/en/reset-password?token=${resetPasswordToken}`;
            sendResetPasswordEmail({ to: user.email, name: user.name, resetUrl });
        }

        res.status(200).json({
            success: true,
            message: 'If an account exists with that email, a password reset link has been sent.',
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token, password } = req.body;

        if (!password || password.length < 8) {
            res.status(400).json({ message: 'Password must be at least 8 characters long' });
            return;
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) {
            res.status(400).json({ message: 'Invalid or expired reset link. Please request a new one.' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successful! You can log in now.' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};