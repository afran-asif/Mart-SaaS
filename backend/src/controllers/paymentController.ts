import { Response, Request } from "express";
import mongoose from "mongoose";
import Order from "../models/Order";
import { Store } from "../models/Store";
import { Product } from "../models/Product";
import { decrypt } from "../utils/encryption";
const SSLCommerzPayment = require("sslcommerz-lts");


const PLATFORM_STORE_ID = process.env.SSLCOMMERZ_STORE_ID as string;
const PLATFORM_STORE_PASSWD = process.env.SSLCOMMERZ_STORE_PASSWORD as string;
const is_live = process.env.SSLCOMMERZ_IS_LIVE === "true";
const FRONTEND_PROTOCOL = process.env.FRONTEND_PROTOCOL || "http";
const FRONTEND_BASE_DOMAIN = process.env.FRONTEND_BASE_DOMAIN || "localhost:3000";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000"

//Payment শুরু করা — order তৈরি + SSLCommerz session initiate
export const initiatePayment = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            customerName,
            customerEmail,
            shippingAddress,
            phone,
            totalAmount,
            items,
            storeId,
            paymentMethod,
        } = req.body;

        if (!customerName || !customerEmail || !shippingAddress || !totalAmount || !items?.length || !storeId) {
            await session.abortTransaction();
            res.status(400).json({ message: "Please provide all required order fields including storeId." });
            return;
        }

        const store = await Store.findById(storeId).select("+sslcommerzStorePassword").session(session);
        if (!store) {
            await session.abortTransaction();
            res.status(404).json({ message: "Store not found." });
            return;
        }

        // stock atomically চেক করে কমানো (আগের মতোই)
        for (const item of items) {
            const updatedProduct = await Product.findOneAndUpdate(
                { _id: item.product, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { new: true, session }
            );

            if (!updatedProduct) {
                await session.abortTransaction();
                res.status(400).json({ message: "Insufficient stock for one of the products in your order." });
                return;
            }
        }

        // Order তৈরি — কিন্তু paymentStatus: Unpaid দিয়ে
        const newOrder = await Order.create(
            [
                {
                    vendorId: store.vendorId,
                    storeId,
                    customerName,
                    customerEmail,
                    shippingAddress,
                    phone,
                    totalAmount,
                    items,
                    status: "Pending",
                    paymentStatus: "Unpaid",
                    paymentMethod: paymentMethod === "COD" ? "COD" : "SSLCommerz",
                },
            ],
            { session }
        );

        const order = newOrder[0];

        if (paymentMethod === "COD") {
            await session.commitTransaction();
            res.status(200).json({
                success: true,
                paymentMethod: "COD",
                orderId: order._id,
            })
            return;
        }

        // Hybrid SSLCommerz Credential Logic
        let sslStoreId = PLATFORM_STORE_ID;
        let sslStorePasswd = PLATFORM_STORE_PASSWD;

        if (store.useOwnSSLCommerz && store.sslcommerzStoreId && store.sslcommerzStorePassword) {
            sslStoreId = store.sslcommerzStoreId;
            sslStorePasswd = decrypt(store.sslcommerzStorePassword);
        }

        // SSLCommerz এ পাঠানোর ডেটা (gateway session)
        const sslData = {
            total_amount: totalAmount,
            currency: "BDT",
            tran_id: order._id.toString(), // order._id কেই transaction id হিসেবে ব্যবহার করছি
            success_url: `${BACKEND_URL}/api/v1/payment/success?subdomain=${store.subdomain}`,
            fail_url: `${BACKEND_URL}/api/v1/payment/fail?subdomain=${store.subdomain}`,
            cancel_url: `${BACKEND_URL}/api/v1/payment/cancel?subdomain=${store.subdomain}`,
            ipn_url: `${BACKEND_URL}/api/v1/payment/ipn?subdomain=${store.subdomain}`,
            shipping_method: "Courier",
            product_name: "Order from " + store.storeName,
            product_category: "General",
            product_profile: "general",
            cus_name: customerName,
            cus_email: customerEmail,
            cus_add1: shippingAddress,
            cus_phone: phone || "01700000000",
            ship_name: customerName,
            ship_add1: shippingAddress,
            ship_city: "Dhaka",
            ship_postcode: "1000",
            ship_country: "Bangladesh",
        };

        const sslcz = new SSLCommerzPayment(sslStoreId, sslStorePasswd, is_live);
        const apiResponse = await sslcz.init(sslData);

        if (!apiResponse?.GatewayPageURL) {
            await session.abortTransaction();
            res.status(500).json({ message: "Failed to initiate payment session." });
            return;
        }

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            paymentMethod: "SSLCommerz",
            paymentUrl: apiResponse.GatewayPageURL,
            orderId: order._id,
        });
    } catch (error: any) {
        await session.abortTransaction();
        res.status(500).json({ message: error.message || "Failed to initiate payment" });
    } finally {
        session.endSession();
    }
};

//Payment সফল হলে
export const paymentSuccess = async (req: Request, res: Response) => {
    console.log("✅ SUCCESS HANDLER HIT:", req.body);
    try {
        const { tran_id, val_id } = req.body;
        const subdomain = req.query.subdomain as string;

        // Step 1: Order খোঁজো
        const order = await Order.findById(tran_id);
        if (!order) {
            res.redirect(`${FRONTEND_URL}/payment-failed`);
            return;
        }

        // Step 2: Already Paid হলে আবার process করার দরকার নেই (IPN already করে থাকতে পারে)
        if (order.paymentStatus === "Paid") {
            res.redirect(`${FRONTEND_PROTOCOL}://${subdomain}.${FRONTEND_BASE_DOMAIN}/order-confirmed?orderId=${order._id}`);
            return;
        }

        // Step 3: val_id না থাকলে reject করো
        if (!val_id) {
            res.redirect(`${FRONTEND_PROTOCOL}://${subdomain}.${FRONTEND_BASE_DOMAIN}/payment-failed`);
            return;
        }

        // Step 4: Store থেকে SSL credentials নাও (vendor নিজের SSL ব্যবহার করলে)
        const store = await Store.findById(order.storeId).select("+sslcommerzStorePassword");
        let sslStoreId = PLATFORM_STORE_ID;
        let sslStorePasswd = PLATFORM_STORE_PASSWD;

        if (store?.useOwnSSLCommerz && store.sslcommerzStoreId && store.sslcommerzStorePassword) {
            sslStoreId = store.sslcommerzStoreId;
            sslStorePasswd = decrypt(store.sslcommerzStorePassword);
        }

        // Step 5: SSLCommerz API তে validation call — payment সত্যিই হয়েছে কিনা confirm করো
        const sslcz = new SSLCommerzPayment(sslStoreId, sslStorePasswd, is_live);
        const validation = await sslcz.validate({ val_id });

        if (!validation || validation.status !== "VALID") {
            console.log("❌ SSLCommerz validation failed:", validation);
            res.redirect(`${FRONTEND_PROTOCOL}://${subdomain}.${FRONTEND_BASE_DOMAIN}/payment-failed`);
            return;
        }

        // Step 6: Race condition fix —
        // যদি fail/cancel callback আগে এসে stock restore করে দিয়ে থাকে,
        // তাহলে success এ আবার stock কমাতে হবে, নইলে product free-তে যাবে
        if (order.status === "Cancelled" && (order.paymentStatus === "Failed" || order.paymentStatus === "Cancelled")) {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: -item.quantity },
                });
            }
            order.status = "Pending";
        }

        // Step 7: সব ঠিক — Paid করো
        order.paymentStatus = "Paid";
        order.transactionId = val_id;
        await order.save();

        res.redirect(`${FRONTEND_PROTOCOL}://${subdomain}.${FRONTEND_BASE_DOMAIN}/order-confirmed?orderId=${order._id}`);
    } catch (error: any) {
        console.error("paymentSuccess error:", error);
        res.redirect(`${FRONTEND_URL}/payment-failed`);
    }
};

//Payment fail হলে
export const paymentFail = async (req: Request, res: Response) => {
    console.log("❌ FAIL HANDLER HIT:", req.body); //ডিবাগ লাইন
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { tran_id } = req.body;
        const subdomain = req.query.subdomain as string;
        const order = await Order.findById(tran_id).session(session);

        if (order && order.paymentStatus === "Unpaid") {
            // stock ফেরত দাও (যেহেতু payment fail হয়েছে)
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } }, { session });
            }
            order.paymentStatus = "Failed";
            order.status = "Cancelled";
            await order.save({ session });
        }

        await session.commitTransaction();
        res.redirect(`${FRONTEND_PROTOCOL}://${subdomain}.${FRONTEND_BASE_DOMAIN}/payment-failed`);
    } catch (error: any) {
        await session.abortTransaction();
        res.redirect(`${FRONTEND_URL}/payment-failed`);
    } finally {
        session.endSession();
    }
};

//Payment cancel হলে (কাস্টমার নিজে বাতিল করলে)
export const paymentCancel = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { tran_id } = req.body;
        const subdomain = req.query.subdomain as string;
        const order = await Order.findById(tran_id).session(session);

        if (order && order.paymentStatus === "Unpaid") {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } }, { session });
            }
            order.paymentStatus = "Cancelled";
            order.status = "Cancelled";
            await order.save({ session });
        }

        await session.commitTransaction();
        
        res.redirect(`${FRONTEND_PROTOCOL}://${subdomain}.${FRONTEND_BASE_DOMAIN}/payment-failed?reason=cancelled`);
    } catch (error: any) {
        await session.abortTransaction();
        res.redirect(`${FRONTEND_URL}/`);
    } finally {
        session.endSession();
    }
};

//IPN — সার্ভার-টু-সার্ভার কনফার্মেশন (সবচেয়ে বিশ্বস্ত সোর্স)
export const paymentIPN = async (req: Request, res: Response) => {
    try {
        const { tran_id, status } = req.body;

        const order = await Order.findById(tran_id);
        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }

        if (status === "VALID" && order.paymentStatus !== "Paid") {
            order.paymentStatus = "Paid";
            order.transactionId = req.body.val_id || tran_id;
            await order.save();
        }

        res.status(200).json({ received: true });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};