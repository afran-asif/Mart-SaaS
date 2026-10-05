import { describe, test, expect, beforeEach, afterEach, jest } from "@jest/globals";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { User } from "../src/models/User";
import { Store } from "../src/models/Store";
import Order from "../src/models/Order";
import { encrypt } from "../src/utils/encryption";
import courierRoutes from "../src/routes/courierRoutes";
import { createConsignment, getConsignmentStatus } from "../src/utils/steadfast";

const app = express();
app.use(express.json());
app.use("/api/v1/courier", courierRoutes);

process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "0".repeat(64);
const sign = (id: string) => jwt.sign({ userId: id }, process.env.JWT_SECRET!);

const okFetch = (body: any) =>
    (async () =>
        ({
            ok: true,
            json: async () => body,
        } as any)) as typeof fetch;

describe("steadfast client (mocked fetch)", () => {
    test("create → consignment + tracking", async () => {
        const r = await createConsignment(
            { apiKey: "k", secretKey: "s" },
            { invoice: "VD-1", recipientName: "C", recipientPhone: "0171", recipientAddress: "Dhaka", codAmount: 500 },
            okFetch({ status: 200, consignment: { consignment_id: "1001", tracking_code: "TRK1" } })
        );
        expect(r).toMatchObject({ consignmentId: "1001", trackingCode: "TRK1" });
    });

    test("create without consignment_id throws", async () => {
        await expect(
            createConsignment(
                { apiKey: "k", secretKey: "s" },
                { invoice: "VD-2", recipientName: "C", recipientPhone: "0171", recipientAddress: "Dhaka", codAmount: 500 },
                okFetch({ status: 200, consignment: {} })
            )
        ).rejects.toThrow();
    });

    test("status maps delivery_status", async () => {
        const r = await getConsignmentStatus(
            { apiKey: "k", secretKey: "s" },
            "1001",
            okFetch({ status: 200, delivery_status: "on_the_way" })
        );
        expect(r.status).toBe("on_the_way");
    });

    test("API error message surfaces", async () => {
        await expect(
            createConsignment(
                { apiKey: "bad", secretKey: "bad" },
                { invoice: "VD-3", recipientName: "C", recipientPhone: "0171", recipientAddress: "Dhaka", codAmount: 500 },
                okFetch({ status: 400, message: "Invalid API keys" })
            )
        ).rejects.toThrow("Invalid API keys");
    });
});

describe("courier routes (vendor)", () => {
    let store: any;
    let token: string;
    let order: any;
    const realFetch = global.fetch;

    beforeEach(async () => {
        const t = Date.now();
        const user = await User.create({ name: "V", email: `co${t}@t.com`, password: "x", role: "vendor", isVerified: true });
        store = await Store.create({
            vendorId: user._id,
            storeName: "S",
            subdomain: `co${t}`,
            steadfastApiKey: encrypt("APIKEY"),
            steadfastSecretKey: encrypt("SECRET"),
        });
        order = await Order.create({
            vendorId: user._id,
            storeId: store._id,
            customerName: "C",
            customerEmail: "c@c.com",
            phone: "01700000000",
            shippingAddress: "Road 1",
            shippingDistrict: "Dhaka",
            totalAmount: 500,
            items: [],
        });
        token = sign(user._id.toString());
    });

    afterEach(() => {
        global.fetch = realFetch;
    });

    const auth = (req: any) => req.set("Authorization", `Bearer ${token}`);

    test("send → saves consignment + tracking", async () => {
        global.fetch = okFetch({ status: 200, consignment: { consignment_id: "2002", tracking_code: "TRK2" } }) as any;
        const r = await auth(request(app).post(`/api/v1/courier/steadfast/send/${order._id}`));
        expect(r.status).toBe(200);
        expect(r.body).toMatchObject({ consignmentId: "2002", trackingCode: "TRK2" });
        const saved = await Order.findById(order._id);
        expect(saved?.courierProvider).toBe("steadfast");
        expect(saved?.trackingCode).toBe("TRK2");
    });

    test("resend blocked", async () => {
        global.fetch = okFetch({ status: 200, consignment: { consignment_id: "2002", tracking_code: "TRK2" } }) as any;
        await auth(request(app).post(`/api/v1/courier/steadfast/send/${order._id}`));
        const r = await auth(request(app).post(`/api/v1/courier/steadfast/send/${order._id}`));
        expect(r.status).toBe(400);
    });

    test("cancelled order cannot be sent", async () => {
        await Order.findByIdAndUpdate(order._id, { status: "Cancelled" });
        const r = await auth(request(app).post(`/api/v1/courier/steadfast/send/${order._id}`));
        expect(r.status).toBe(400);
    });

    test("missing keys → 400 with message", async () => {
        await Store.findByIdAndUpdate(store._id, { steadfastApiKey: null, steadfastSecretKey: null });
        const r = await auth(request(app).post(`/api/v1/courier/steadfast/send/${order._id}`));
        expect(r.status).toBe(400);
        expect(r.body.message).toMatch(/not configured/i);
    });

    test("status refresh saves courierStatus", async () => {
        global.fetch = okFetch({ status: 200, consignment: { consignment_id: "3003", tracking_code: "TRK3" } }) as any;
        await auth(request(app).post(`/api/v1/courier/steadfast/send/${order._id}`));
        global.fetch = okFetch({ status: 200, delivery_status: "delivered" }) as any;
        const r = await auth(request(app).get(`/api/v1/courier/steadfast/status/${order._id}`));
        expect(r.status).toBe(200);
        expect(r.body.courierStatus).toBe("delivered");
    });

    test("balance returns number", async () => {
        global.fetch = okFetch({ status: 200, balance: 1250 }) as any;
        const r = await auth(request(app).get("/api/v1/courier/steadfast/balance"));
        expect(r.status).toBe(200);
        expect(r.body.balance).toBe(1250);
    });
});
