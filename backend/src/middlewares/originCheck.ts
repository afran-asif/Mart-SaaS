import { Request, Response, NextFunction } from "express";
import { isVerifiedCustomDomain } from "../utils/customDomainCache";

const allowedOriginPattern = /^https?:\/\/([a-zA-Z0-9-]+\.)?(localhost:3000|mart-saa-s\.vercel\.app|vendoo\.shop)$/;

// 🛡️ CSRF defense — state বদলানো request (POST/PUT/PATCH/DELETE) কোন পেজ থেকে এলো, যাচাই করা।
// Browser নিজে Origin/Referer header পাঠায় — attacker-এর JS এটা বদলাতে বা মুছতে পারে না।
// Header না থাকলে (Postman/server-to-server/mobile app) যেতে দেওয়া হয়।
export const originCheck = (req: Request, res: Response, next: NextFunction): void => {
    if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
        next();
        return;
    }

    const source = (req.headers.origin as string) || (req.headers.referer as string) || "";
    if (!source) {
        next();
        return;
    }

    if (allowedOriginPattern.test(source)) {
        next();
        return;
    }

    try {
        const host = new URL(source).hostname.toLowerCase().replace(/^www\./, "");
        if (isVerifiedCustomDomain(host)) {
            next();
            return;
        }
    } catch {
        /* invalid source — নিচে reject হবে */
    }

    res.status(403).json({ message: "Forbidden: invalid request origin." });
};