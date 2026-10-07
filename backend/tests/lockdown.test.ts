import { describe, test, expect, beforeEach } from "@jest/globals";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { User } from "../src/models/User";
import { Store } from "../src/models/Store";
import { Product } from "../src/models/Product";
import Order from "../src/models/Order";
import productRoutes from "../src/routes/productRoutes";
import orderRoutes from "../src/routes/orderRoutes";
import tenantRoutes from "../src/routes/tenantRoutes";
import subscriptionRoutes from "../src/routes/subscriptionRoutes";
import { requireActivePlan } from "../src/middlewares/planGate";

const app = express();
app.use(express.json());
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/tenant", tenantRoutes);
app.use("/api/v1/subscription", subscriptionRoutes);

const sign = (id: string) => jwt.sign({ userId: id }, process.env.JWT_SECRET!);
const DAY_MS = 24 * 60 * 60 * 1000;

describe("lockdown (no free tier)", () => {
    let vendorTok: string;
    let lockedStore: any;
    let proStore: any;
    let product: any;

    beforeEach(async () => {
        const t = Date.now();
        const user = await User.create({ name: "V", email: `ld${t}@t.com`, password: "x", role: "vendor", isVerified: true });
        // trial শেষ 20 দিন আগে → takedown-ও পার (grace 15d)
        lockedStore = await Store.create({
            vendorId: user._id,
            storeName: "L",
            subdomain: `ld${t}`,
            plan: "pro",
            planExpiresAt: new Date(Date.now() - 20 * DAY_MS),
        });
        // active trial
        const user2 = await User.create({ name: "W", email: `lp${t}@t.com`, password: "x", role: "vendor", isVerified: true });
        proStore = await Store.create({
            vendorId: user2._id,
            storeName: "P",
            subdomain: `lp${t}`,
            plan: "pro",
            planExpiresAt: new Date(Date.now() + 20 * DAY_MS),
            // memory-server unique+sparse quirk: দুটো explicit null → dup error, তাই dummy value
            customDomain: `lp-${t}.example.com`,
        });
        product = await Product.create({
            vendorId: user._id, storeId: lockedStore._id, name: "P", price: 500, stock: 5, description: "d",
        });
        vendorTok = sign(user._id.toString());
    });

    const vauth = (req: any) => req.set("Authorization", `Bearer ${vendorTok}`);
    const tenant = (req: any, sub: string) => req.set("X-Tenant-Subdomain", sub);

    test("locked vendor API blocked with locked flag", async () => {
        const r = await vauth(request(app).get("/api/v1/products"));
        expect(r.status).toBe(403);
        expect(r.body.locked).toBe(true);
    });

    test("locked vendor cannot create/update product", async () => {
        const r = await vauth(request(app).post("/api/v1/products")).send({ name: "X", price: 1, stock: 1 });
        expect(r.status).toBe(403);
    });

    test("public order create on locked store → 403", async () => {
        const r = await request(app).post("/api/v1/orders").send({
            customerName: "C",
            customerEmail: "c@c.com",
            shippingAddress: "R",
            phone: "0171",
            totalAmount: 500,
            items: [{ product: product._id.toString(), quantity: 1, price: 500 }],
            storeId: lockedStore._id.toString(),
        });
        expect(r.status).toBe(403);
        expect(r.body.locked).toBe(true);
    });

    test("locked store (even 20d expired) → still browseable 200, no takedown (SEO safe)", async () => {
        const r = await tenant(request(app).get("/api/v1/tenant/products"), lockedStore.subdomain);
        expect(r.status).toBe(200);
    });

    test("subscription me/request open for locked vendor", async () => {
        const me = await vauth(request(app).get("/api/v1/subscription/me"));
        expect(me.status).toBe(200);
        expect(me.body.subscription.locked).toBe(true);
        const req2 = await vauth(request(app).post("/api/v1/subscription/request")).send({
            trxId: "TRXLOCK1",
            senderNumber: "0171",
        });
        expect(req2.status).toBe(201);
    });
});

describe("lockdown grace window", () => {
    test("locked 5 days ago → still browseable (200)", async () => {
        const t = Date.now();
        const user = await User.create({ name: "G", email: `lg${t}@t.com`, password: "x", role: "vendor", isVerified: true });
        const sub = `lg${t}`;
        await Store.create({
            vendorId: user._id,
            storeName: "G",
            subdomain: sub,
            plan: "pro",
            planExpiresAt: new Date(Date.now() - 5 * DAY_MS),
        });
        const r = await request(app).get("/api/v1/tenant/products").set("X-Tenant-Subdomain", sub);
        expect(r.status).toBe(200);
    });

    test("suspended vendor API blocked", async () => {
        const t = Date.now();
        const user = await User.create({ name: "S", email: `ls${t}@t.com`, password: "x", role: "vendor", isVerified: true });
        await Store.create({
            vendorId: user._id,
            storeName: "S",
            subdomain: `ls${t}`,
            status: "suspended",
            plan: "pro",
            planExpiresAt: new Date(Date.now() + 20 * DAY_MS),
        });
        const tok = sign(user._id.toString());
        const r = await request(app).get("/api/v1/products").set("Authorization", `Bearer ${tok}`);
        expect(r.status).toBe(403);
        expect(r.body.suspended).toBe(true);
    });

    test("super-admin bypasses the gate", async () => {
        const admin = await User.create({ name: "A", email: `la${Date.now()}@t.com`, password: "x", role: "super-admin", isVerified: true });
        let status = 0;
        let nexted = false;
        const res: any = { status: (c: number) => { status = c; return res; }, json: () => res };
        await requireActivePlan({ user: { _id: admin._id, role: "super-admin" } } as any, res, () => { nexted = true; });
        expect(nexted).toBe(true);
        expect(status).toBe(0);
    });

    test("active trial vendor passes the gate", async () => {
        const t = Date.now();
        const user = await User.create({ name: "P", email: `lp2${t}@t.com`, password: "x", role: "vendor", isVerified: true });
        await Store.create({
            vendorId: user._id,
            storeName: "P2",
            subdomain: `lp2${t}`,
            plan: "pro",
            planExpiresAt: new Date(Date.now() + 20 * DAY_MS),
        });
        let nexted = false;
        const res: any = { status: () => res, json: () => res };
        await requireActivePlan({ user: { _id: user._id, role: "vendor" } } as any, res, () => { nexted = true; });
        expect(nexted).toBe(true);
    });
});
