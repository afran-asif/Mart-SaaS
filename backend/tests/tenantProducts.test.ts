import { describe, test, expect, beforeEach } from "@jest/globals";
import express from "express";
import request from "supertest";
import { User } from "../src/models/User";
import { Store } from "../src/models/Store";
import { Product } from "../src/models/Product";
import tenantRoutes from "../src/routes/tenantRoutes";

const app = express();
app.use(express.json());
app.use("/api/v1/tenant", tenantRoutes);

describe("tenant products pagination", () => {
    let subdomain: string;

    beforeEach(async () => {
        const t = Date.now();
        const user = await User.create({ name: "V", email: `p${t}@t.com`, password: "x", role: "vendor", isVerified: true });
        subdomain = `pag${t}`;
        const store = await Store.create({ vendorId: user._id, storeName: "S", subdomain });
        const docs = [];
        for (let i = 0; i < 30; i++) {
            docs.push({
                vendorId: user._id, storeId: store._id, name: `P${i}`, price: 100 + i, stock: 5,
                description: "d", category: i < 10 ? "A" : "B", featured: i < 3,
            });
        }
        await Product.insertMany(docs);
    });

    const tenant = (req: any) => req.set("X-Tenant-Subdomain", subdomain);

    test("no params → all (backward compat)", async () => {
        const r = await tenant(request(app).get("/api/v1/tenant/products"));
        expect(r.status).toBe(200);
        expect(r.body.products).toHaveLength(30);
        expect(r.body.total).toBeUndefined();
    });

    test("page+limit → slice with total/pages", async () => {
        const r1 = await tenant(request(app).get("/api/v1/tenant/products")).query({ page: 1, limit: 24 });
        expect(r1.status).toBe(200);
        expect(r1.body.products).toHaveLength(24);
        expect(r1.body.total).toBe(30);
        expect(r1.body.pages).toBe(2);

        const r2 = await tenant(request(app).get("/api/v1/tenant/products")).query({ page: 2, limit: 24 });
        expect(r2.body.products).toHaveLength(6);
        expect(r2.body.page).toBe(2);
    });

    test("category filter (case-insensitive) + pagination", async () => {
        const r = await tenant(request(app).get("/api/v1/tenant/products")).query({ category: "a", page: 1, limit: 24 });
        expect(r.status).toBe(200);
        expect(r.body.total).toBe(10);
        expect(r.body.products).toHaveLength(10);
    });

    test("featured filter returns all featured", async () => {
        const r = await tenant(request(app).get("/api/v1/tenant/products")).query({ featured: "true" });
        expect(r.status).toBe(200);
        expect(r.body.total).toBe(3);
    });

    test("random sort returns sample with total", async () => {
        const r = await tenant(request(app).get("/api/v1/tenant/products")).query({ sort: "random", limit: 12 });
        expect(r.status).toBe(200);
        expect(r.body.products.length).toBeLessThanOrEqual(12);
        expect(r.body.total).toBe(30);
    });

    test("random sort never returns empty when products exist ($match cast regression)", async () => {
        for (let i = 0; i < 3; i++) {
            const r = await tenant(request(app).get("/api/v1/tenant/products")).query({ sort: "random", limit: 12 });
            expect(r.body.products.length).toBeGreaterThan(0);
        }
    });
});
