import { describe, test, expect, beforeEach } from "@jest/globals";
import express from "express";
import request from "supertest";
import { User } from "../src/models/User";
import { Store } from "../src/models/Store";
import Order from "../src/models/Order";
import orderRoutes from "../src/routes/orderRoutes";

const app = express();
app.use(express.json());
app.use("/api/v1/orders", orderRoutes);

describe("public order tracking", () => {
    let orderId: string;
    const phone = "01712345678";

    beforeEach(async () => {
        const t = Date.now();
        const user = await User.create({ name: "V", email: `t${t}@t.com`, password: "x", role: "vendor", isVerified: true });
        const store = await Store.create({ vendorId: user._id, storeName: "S", subdomain: `trk${t}` });
        const order = await Order.create({
            vendorId: user._id,
            storeId: store._id,
            customerName: "C",
            customerEmail: "c@c.com",
            phone,
            shippingAddress: "Road 1",
            totalAmount: 500,
            items: [],
            status: "Processing",
        });
        orderId = (order._id as unknown as { toString(): string }).toString();
    });

    test("correct phone returns limited order data", async () => {
        const r = await request(app).get(`/api/v1/orders/track/${orderId}`).query({ phone });
        expect(r.status).toBe(200);
        expect(r.body.order.status).toBe("Processing");
        expect(r.body.order.totalAmount).toBe(500);
    });

    test("wrong phone, bad id, malformed id → same 404", async () => {
        const r1 = await request(app).get(`/api/v1/orders/track/${orderId}`).query({ phone: "01999999999" });
        expect(r1.status).toBe(404);
        const r2 = await request(app).get("/api/v1/orders/track/000000000000000000000000").query({ phone });
        expect(r2.status).toBe(404);
        const r3 = await request(app).get("/api/v1/orders/track/abc").query({ phone });
        expect(r3.status).toBe(404);
    });
});
