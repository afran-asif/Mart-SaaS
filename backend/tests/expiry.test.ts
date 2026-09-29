import { describe, test, expect, beforeEach } from "@jest/globals";
import express from "express";
import request from "supertest";
import { Store } from "../src/models/Store";
import { User } from "../src/models/User";
import { Coupon } from "../src/models/Coupon";
import tenantRoutes from "../src/routes/tenantRoutes";
import couponRoutes from "../src/routes/couponRoutes";

const app = express();
app.use(express.json());
app.use("/api/v1/tenant", tenantRoutes);
app.use("/api/v1/coupons", couponRoutes);

describe("pro expiry enforcement", () => {
    let subdomain: string;

    beforeEach(async () => {
        const t = Date.now();
        const user = await User.create({ name: "V", email: `x${t}@t.com`, password: "x", role: "vendor", isVerified: true });
        subdomain = `exp${t}`;
        // free store with pro leftovers (expired pro)
        await Store.create({
            vendorId: user._id,
            storeName: "S",
            subdomain,
            plan: "free",
            planExpiresAt: null,
            theme: "luxe",
            facebookPixelId: "123",
            useOwnSSLCommerz: true,
            sslcommerzStoreId: "x",
        });
        const store = await Store.findOne({ subdomain });
        await Coupon.create({ vendorId: user._id, storeId: store!._id, code: "OLD10", discountType: "fixed", discountValue: 10 });
    });

    const tenant = (req: any) => req.set("X-Tenant-Subdomain", subdomain);

    test("tenant info downgrades gracefully, storefront stays live", async () => {
        const r = await tenant(request(app).get("/api/v1/tenant/store"));
        expect(r.status).toBe(200);
        expect(r.body.store.theme).toBe("classic");
        expect(r.body.store.facebookPixelId).toBeNull();
        expect(r.body.store.onlinePaymentEnabled).toBe(false);
        expect(r.body.store.plan).toBe("free");
        // storefront data intact (not broken)
        expect(r.body.store.storeName).toBe("S");
    });

    test("old coupons stop working on free", async () => {
        const r = await tenant(request(app).get("/api/v1/coupons/validate")).query({ code: "OLD10", subtotal: 500 });
        expect(r.status).toBe(403);
    });
});
