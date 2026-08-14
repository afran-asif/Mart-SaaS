import dotenv from "dotenv";
dotenv.config();

import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import storeRoutes from './routes/storeRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import { connectDB } from "./config/db";
import authRoutes from './routes/authRoutes';
import tenantRoutes from './routes/tenantRoutes';

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
const allowedOriginPattern = /^http:\/\/([a-zA-Z0-9-]+\.)?localhost:3000$/;

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true); // Postman/server-to-server এর জন্য
            if (allowedOriginPattern.test(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);

app.get("/",(req: Request, res: Response) => {
    res.send("Mart-SaaS Backend Server is Running Perfectly!");
})

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/store', storeRoutes);
app.use('/api/v1/products', productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use('/api/v1/tenant', tenantRoutes);
app.use("/uploads", express.static("uploads"));


const startServer = async () => {
    await connectDB();
    
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    })
}

startServer();
