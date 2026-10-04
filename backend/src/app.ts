import dotenv from "dotenv";
dotenv.config();

import "./instrument";
import { validateEnv } from "./config/env";
validateEnv();

import express, { Application, Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import storeRoutes from './routes/storeRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import { connectDB } from "./config/db";
import authRoutes from './routes/authRoutes';
import tenantRoutes from './routes/tenantRoutes';
import paymentRoutes from './routes/paymentRoutes';
import paymentCallbackRoutes from './routes/paymentCallbackRoutes'
import categoryRoutes from './routes/categoryRoutes';
import couponRoutes from './routes/couponRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import adminRoutes from './routes/adminRoutes';
import reviewRoutes from './routes/reviewRoutes';
import { refreshCustomDomainCache, isVerifiedCustomDomain } from "./utils/customDomainCache";
import { reverifyCustomDomains } from "./jobs/reverifyCustomDomains";
import * as Sentry from "@sentry/node";
import { originCheck } from "./middlewares/originCheck";
import { seedPlans } from "./models/Plan";

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 🛡️ Security headers (XSS filter, clickjacking, MIME-sniffing...)
app.use(helmet());

// 🚦 Rate limiting — brute-force ও flood ঠেকাতে
// trust proxy loopback-only: সরাসরি চললে socket IP, Cloudflare Tunnel-এ চললে
// cloudflared-এর X-Forwarded-For থেকে আসল client IP (spoof-safe, শুধু localhost trust করে)
app.set("trust proxy", "loopback");
const tooManyMsg = { message: "Too many requests. Please try again later." };
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 150, standardHeaders: true, legacyHeaders: false, message: tooManyMsg });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50, standardHeaders: true, legacyHeaders: false, message: tooManyMsg });
const paymentLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 15, standardHeaders: true, legacyHeaders: false, message: tooManyMsg });
app.use("/api/", globalLimiter);
app.use("/api/v1/auth", authLimiter);
app.use("/api/v1/payment", paymentLimiter);
// 🛡️ CSRF — state-changing request-এর Origin যাচাই (GET বাদে সব /api/ route-এ)
app.use("/api/", originCheck);
const allowedOriginPattern = /^https?:\/\/([a-zA-Z0-9-]+\.)?(localhost:3000|mart-saa-s\.vercel\.app|vendoo\.shop)$/;

app.use("/api/v1/payment", paymentCallbackRoutes);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true); // Postman/server-to-server এর জন্য
            if (allowedOriginPattern.test(origin)) {
                return callback(null, true);
            }
            // verified custom domain হলে allow (ex: https://shop.dressif.com)
            try {
                const host = new URL(origin).hostname.toLowerCase().replace(/^www\./, "");
                if (isVerifiedCustomDomain(host)) {
                    return callback(null, true);
                }
            } catch { /* invalid origin — নিচে reject হবে */ }
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);

app.get("/",(req: Request, res: Response) => {
    res.send("Vendoo Backend Server is Running Perfectly!");
})

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/store', storeRoutes);
app.use('/api/v1/products', productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/subscription', subscriptionRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/tenant', tenantRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/v1/payment", paymentRoutes);

// 🐞 Sentry — ধরা না-পড়া express error auto-report (DSN থাকলে; না থাকলে no-op)
app.use(((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (process.env.SENTRY_DSN) Sentry.captureException(err);
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
}) as express.ErrorRequestHandler);

const startServer = async () => {
    await connectDB();

    await seedPlans();
    await refreshCustomDomainCache();
    setInterval(refreshCustomDomainCache, 5 * 60 * 1000);

    // 🔁 Custom domain ownership re-check — প্রতিদিন একবার (প্রথম run boot-এর ৫ মিনিট পর)
    // TXT পরপর ৩ দিন missing থাকলে domain revoke হয় (expired/takeover সুরক্ষা)
    if (process.env.DISABLE_DOMAIN_REVERIFY !== "1") {
        const runReverify = async () => {
            try {
                const summary = await reverifyCustomDomains();
                console.log(`[REVERIFY] done: ${JSON.stringify(summary)}`);
            } catch (error) {
                console.error(`[REVERIFY] failed: ${(error as Error).message}`);
            }
        };
        setTimeout(runReverify, 5 * 60 * 1000);
        setInterval(runReverify, 24 * 60 * 60 * 1000);
    }
    
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    })
}

startServer();
