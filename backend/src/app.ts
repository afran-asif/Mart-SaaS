import dotenv from "dotenv";
dotenv.config();

import express, { Application, Request, Response } from "express";
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
import { refreshCustomDomainCache, isVerifiedCustomDomain } from "./utils/customDomainCache";
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
// NOTE: backend সরাসরি চলে (সামনে কোনো proxy নেই), তাই trust proxy OFF —
// ভবিষ্যতে Cloudflare/nginx-এর পেছনে গেলে app.set("trust proxy", 1) লাগবে।
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
app.use('/api/v1/tenant', tenantRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/v1/payment", paymentRoutes);

const startServer = async () => {
    await connectDB();

    await seedPlans();
    await refreshCustomDomainCache();
    setInterval(refreshCustomDomainCache, 5 * 60 * 1000);
    
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    })
}

startServer();
