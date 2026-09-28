import { describe, test, expect, beforeEach } from "@jest/globals";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { User } from "../src/models/User";
import { Store } from "../src/models/Store";
import { Coupon } from "../src/models/Coupon";
import subscriptionRoutes from "../src/routes/subscriptionRoutes";
import couponRoutes from "../src/routes/couponRoutes";

const app = express();
app.use(express.json());
app.use("/api/v1/subscription", subscriptionRoutes);
app.use("/api/v1/coupons", couponRoutes);

const sign = (id: string) => jwt.sign({ userId: id }, process.env.JWT_SECRET!);

describe("subscription flow", () => {
    let vendor: any;
    let store: any;
    let vendorTok: string;
    let adminTok: string;

    beforeEach(async () => {
        const t = Date.now();
        vendor = await User.create({ name: "V", email: `v${t}@t.com`, password: "x", role: "vendor", isVerified: true });
        const admin = await User.create({ name: "A", email: `a${t}@t.com`, password: "x", role: "super-admin", isVerified: true });
        store = await Store.create({ vendorId: vendor._id, storeName: "S", subdomain: `sub${t}` });
        vendorTok = sign(vendor._id.toString());
        adminTok = sign(admin._id.toString());
    });

    const vauth = (req: any) => req.set("Authorization", `Bearer ${vendorTok}`);
    const aauth = (req: any) => req.set("Authorization", `Bearer ${adminTok}`);

    test("request → duplicate blocked → approve → pro + coupon works", async () => {
        let r = await vauth(request(app).post("/api/v1/subscription/request")).send({ trxId: "T1", senderNumber: "0171" });
        expect(r.status).toBe(201);

        r = await vauth(request(app).post("/api/v1/subscription/request")).send({ trxId: "T2", senderNumber: "0171" });
        expect(r.status).toBe(400);

        r = await aauth(request(app).get("/api/v1/subscription/requests?status=pending"));
        expect(r.status).toBe(200);
        expect(r.body.requests.length).toBeGreaterThanOrEqual(1);
        const id = r.body.requests[0]._id;

        r = await aauth(request(app).post(`/api/v1/subscription/requests/${id}/approve`));
        expect(r.status).toBe(200);

        r = await vauth(request(app).get("/api/v1/subscription/me"));
        expect(r.body.subscription.plan).toBe("pro");

        r = await vauth(request(app).post("/api/v1/coupons")).send({ code: "PRO10", discountType: "fixed", discountValue: 10 });
        expect(r.status).toBe(201);
        await Coupon.deleteOne({ _id: r.body.coupon._id });
    });

    test("free store cannot create coupon (403)", async () => {
        const r = await vauth(request(app).post("/api/v1/coupons")).send({ code: "FREE10", discountType: "fixed", discountValue: 10 });
        expect(r.status).toBe(403);
        expect(r.body.proRequired).toBe(true);
    });

    test("vendor blocked from admin endpoints (403)", async () => {
        const r = await vauth(request(app).get("/api/v1/subscription/requests"));
        expect(r.status).toBe(403);
    });
});
