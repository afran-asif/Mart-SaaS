import { describe, test, expect, beforeEach } from "@jest/globals";
import express from "express";
import request from "supertest";
import { User } from "../src/models/User";
import { Store } from "../src/models/Store";
import { Product } from "../src/models/Product";
import { Category } from "../src/models/Category";
import tenantRoutes from "../src/routes/tenantRoutes";

const app = express();
app.use(express.json());
app.use("/api/v1/tenant", tenantRoutes);

describe("tenant categories (storefront)", () => {
    let subdomain: string;

    beforeEach(async () => {
        const t = Date.now();
        const user = await User.create({ name: "V", email: `c${t}@t.com`, password: "x", role: "vendor", isVerified: true });
        subdomain = `cat${t}`;
        const store = await Store.create({ vendorId: user._id, storeName: "S", subdomain });
        await Category.create({ vendorId: user._id, storeId: store._id, name: "Gadgets" });
        await Category.create({ vendorId: user._id, storeId: store._id, name: "Empty" });
        await Product.create({ vendorId: user._id, storeId: store._id, name: "P1", price: 100, stock: 2, description: "d", category: "Gadgets" });
        await Product.create({ vendorId: user._id, storeId: store._id, name: "P2", price: 200, stock: 3, description: "d", category: "gadgets" });
    });

    const tenant = (req: any) => req.set("X-Tenant-Subdomain", subdomain);

    test("returns non-empty categories with counts (case-insensitive)", async () => {
        const r = await tenant(request(app).get("/api/v1/tenant/categories"));
        expect(r.status).toBe(200);
        expect(r.body.categories).toHaveLength(1);
        expect(r.body.categories[0].name).toBe("Gadgets");
        expect(r.body.categories[0].productCount).toBe(2);
    });

    test("unknown store → 404", async () => {
        const r = await request(app).get("/api/v1/tenant/categories").set("X-Tenant-Subdomain", "nope-not-exist");
        expect(r.status).toBe(404);
    });
});
