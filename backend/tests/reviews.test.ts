import { describe, test, expect, beforeEach } from "@jest/globals";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { User } from "../src/models/User";
import { Store } from "../src/models/Store";
import { Product } from "../src/models/Product";
import Order from "../src/models/Order";
import tenantRoutes from "../src/routes/tenantRoutes";
import reviewRoutes from "../src/routes/reviewRoutes";

const app = express();
app.use(express.json());
app.use("/api/v1/tenant", tenantRoutes);
app.use("/api/v1/reviews", reviewRoutes);

const sign = (id: string) => jwt.sign({ userId: id }, process.env.JWT_SECRET!);

describe("reviews", () => {
    let subdomain: string;
    let productId: string;
    let orderId: string;
    let vendorTok: string;
    const phone = "01711111111";

    beforeEach(async () => {
        const t = Date.now();
        const user = await User.create({ name: "V", email: `r${t}@t.com`, password: "x", role: "vendor", isVerified: true });
        subdomain = `rev${t}`;
        const store = await Store.create({ vendorId: user._id, storeName: "S", subdomain });
        const product = await Product.create({ vendorId: user._id, storeId: store._id, name: "P", price: 100, stock: 5, description: "d" });
        productId = (product._id as unknown as { toString(): string }).toString();
        const order: any = await Order.create({
            vendorId: user._id, storeId: store._id, customerName: "C", customerEmail: "c@c.com",
            phone, shippingAddress: "R", totalAmount: 100,
            items: [{ product: product._id, quantity: 1, price: 100 }], status: "Delivered",
        });
        orderId = order._id.toString();
        vendorTok = sign(user._id.toString());
    });

    const tenant = (req: any) => req.set("X-Tenant-Subdomain", subdomain);
    const vauth = (req: any) => req.set("Authorization", `Bearer ${vendorTok}`);

    test("unverified review + duplicate blocked", async () => {
        const payload = { productId, customerName: "Rahim", phone: "01722222222", rating: 4, comment: "valo" };
        let r = await tenant(request(app).post("/api/v1/tenant/reviews")).send(payload);
        expect(r.status).toBe(201);
        expect(r.body.review.verifiedBuyer).toBe(false);

        r = await tenant(request(app).post("/api/v1/tenant/reviews")).send(payload);
        expect(r.status).toBe(400);
    });

    test("verified buyer via orderId + list average", async () => {
        const r = await tenant(request(app).post("/api/v1/tenant/reviews")).send({
            productId, customerName: "C", phone, rating: 5, orderId,
        });
        expect(r.status).toBe(201);
        expect(r.body.review.verifiedBuyer).toBe(true);

        const l = await tenant(request(app).get("/api/v1/tenant/reviews")).query({ productId });
        expect(l.status).toBe(200);
        expect(l.body.count).toBe(1);
        expect(l.body.average).toBe(5);
    });

    test("bad rating rejected", async () => {
        const r = await tenant(request(app).post("/api/v1/tenant/reviews")).send({
            productId, customerName: "X", phone: "01733333333", rating: 9,
        });
        expect(r.status).toBe(400);
    });

    test("vendor hide/show + delete", async () => {
        await tenant(request(app).post("/api/v1/tenant/reviews")).send({
            productId, customerName: "H", phone: "01744444444", rating: 2,
        });
        let l = await vauth(request(app).get("/api/v1/reviews"));
        expect(l.body.reviews).toHaveLength(1);
        const id = l.body.reviews[0]._id;

        let t = await vauth(request(app).patch(`/api/v1/reviews/${id}/visibility`));
        expect(t.body.visible).toBe(false);

        // hidden → public list empty
        l = await tenant(request(app).get("/api/v1/tenant/reviews")).query({ productId });
        expect(l.body.count).toBe(0);

        const d = await vauth(request(app).delete(`/api/v1/reviews/${id}`));
        expect(d.status).toBe(200);
    });
});
