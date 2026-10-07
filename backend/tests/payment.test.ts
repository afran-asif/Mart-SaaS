import { describe, test, expect, beforeEach } from "@jest/globals";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { User } from "../src/models/User";
import { Store } from "../src/models/Store";
import { Product } from "../src/models/Product";
import Order from "../src/models/Order";
import paymentRoutes from "../src/routes/paymentRoutes";

const app = express();
app.use(express.json());
app.use("/api/v1/payment", paymentRoutes);

const sign = (id: string) => jwt.sign({ userId: id }, process.env.JWT_SECRET!);

describe("payment initiate (money path)", () => {
    let store: any;
    let product: any;
    let token: string;

    beforeEach(async () => {
        const email = `pay${Date.now()}@t.com`;
        const user = await User.create({ name: "V", email, password: "x", role: "vendor", isVerified: true });
        store = await Store.create({
            vendorId: user._id,
            storeName: "S",
            subdomain: `pay${Date.now()}`,
            plan: "pro",
            planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
        product = await Product.create({
            vendorId: user._id, storeId: store._id, name: "P", price: 1200, stock: 5, description: "d",
        });
        token = sign(user._id.toString());
    });

    const base = () => ({
        customerName: "C",
        customerEmail: "c@c.com",
        shippingAddress: "Road 1",
        district: "Dhaka",
        thana: "Mirpur",
        phone: "01700000000",
        items: [{ product: product._id.toString(), quantity: 1, price: 1200 }],
        storeId: store._id.toString(),
        paymentMethod: "COD",
    });
    const auth = (req: any) => req.set("Authorization", `Bearer ${token}`);

    test("rejects invalid district", async () => {
        const r = await auth(request(app).post("/api/v1/payment/initiate")).send({ ...base(), totalAmount: 1270, district: "Nope" });
        expect(r.status).toBe(400);
    });

    test("rejects total mismatch (tampered amount)", async () => {
        const r = await auth(request(app).post("/api/v1/payment/initiate")).send({ ...base(), totalAmount: 1200 });
        expect(r.status).toBe(400);
    });

    test("rejects SSLCommerz without vendor gateway", async () => {
        const r = await auth(request(app).post("/api/v1/payment/initiate")).send({ ...base(), totalAmount: 1270, paymentMethod: "SSLCommerz" });
        expect(r.status).toBe(400);
    });

    test("rejects wrong-district thana", async () => {
        const r = await auth(request(app).post("/api/v1/payment/initiate")).send({ ...base(), totalAmount: 1270, thana: "Savar" });
        expect(r.status).toBe(400);
    });

    test("COD success saves district+charge and decrements stock", async () => {
        const r = await auth(request(app).post("/api/v1/payment/initiate")).send({ ...base(), totalAmount: 1270 });
        expect(r.status).toBe(200);
        expect(r.body.paymentMethod).toBe("COD");

        const order = await Order.findById(r.body.orderId).lean();
        expect(order?.shippingDistrict).toBe("Dhaka");
        expect(order?.thana).toBe("Mirpur");
        expect(order?.deliveryCharge).toBe(70);
        expect(order?.totalAmount).toBe(1270);

        const p = await Product.findById(product._id).lean();
        expect(p?.stock).toBe(4);
    });
});
