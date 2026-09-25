import { Request, Response } from "express";
import { User } from "../models/User";
import { Store } from "../models/Store";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendVerificationEmail, sendResetPasswordEmail } from "../utils/sendEmail";

const getFrontendUrl = (): string => {
    return (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");
};

const generateToken = (res: Response, userId: string): string => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
        expiresIn: '7d',
    });

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return token; // ✅ token return করা হচ্ছে
};

export const registerVendor = async (req: Request, res: Response) => {
    try {
        const {name, email, password, storeName, subdomain } = req.body;
        
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
        });

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