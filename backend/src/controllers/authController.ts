import { Request, Response } from "express";
import { User } from "../models/User";
import { Store } from "../models/Store";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'vendor',
        });

        const store = await Store.create({
            vendorId: user._id,
            storeName,
            subdomain,
        });

        const token = generateToken(res, user._id.toString());
        res.status(201).json({
            success: true,
            token, // ✅ token response-এ পাঠানো হচ্ছে
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