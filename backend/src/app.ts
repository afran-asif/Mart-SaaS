import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import storeRoutes from './routes/storeRoutes';
import productRoutes from './routes/productRoutes'
dotenv.config();
import { connectDB } from "./config/db";
import authRoutes from './routes/authRoutes';
import tenantRoutes from './routes/tenantRoutes'
const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))

app.get("/",(req: Request, res: Response) => {
    res.send("Mart-SaaS Backend Server is Running Perfectly!");
})

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/store', storeRoutes);
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/tenant', tenantRoutes);

const startServer = async () => {
    await connectDB();
    
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    })
}

startServer();
