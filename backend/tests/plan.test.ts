import { describe, test, expect } from "@jest/globals";
import { Response } from "express";
import { getEffectivePlan, requirePro, checkProductLimit, isStoreLocked } from "../src/utils/plan";
import { Store } from "../src/models/Store";
import { Product } from "../src/models/Product";
import { User } from "../src/models/User";

const mockRes = () => {
    const res: any = { statusCode: 200, body: null };
    res.status = (code: number) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data: any) => {
        res.body = data;
        return res;
    };
    return res as Response & { statusCode: number; body: any };
};

describe("plan helpers", () => {
    test("no plan field → free", () => {
        expect(getEffectivePlan({} as any)).toBe("free");
    });

    test("pro with future expiry → pro (trial)", () => {
        expect(
            getEffectivePlan({ plan: "pro", planExpiresAt: new Date(Date.now() + 86400000) } as any)
        ).toBe("pro");
    });

    test("pro with past expiry → free", () => {
        expect(
            getEffectivePlan({ plan: "pro", planExpiresAt: new Date(Date.now() - 1000) } as any)
        ).toBe("free");
    });

    test("requirePro blocks free with 403 + flag", () => {
        const res = mockRes();
        expect(requirePro({ plan: "free" } as any, res, "Coupons")).toBe(false);
        expect(res.statusCode).toBe(403);
        expect(res.body.proRequired).toBe(true);
    });

    test("requirePro passes pro", () => {
        const res = mockRes();
        expect(
            requirePro({ plan: "pro", planExpiresAt: new Date(Date.now() + 86400000) } as any, res, "Coupons")
        ).toBe(true);
        expect(res.statusCode).toBe(200);
    });

    test("isStoreLocked: active trial → false, expired → true, free → true", () => {
        expect(isStoreLocked({ plan: "pro", planExpiresAt: new Date(Date.now() + 86400000) } as any)).toBe(false);
        expect(isStoreLocked({ plan: "pro", planExpiresAt: new Date(Date.now() - 1000) } as any)).toBe(true);
        expect(isStoreLocked({ plan: "free" } as any)).toBe(true);
        expect(isStoreLocked({} as any)).toBe(true);
    });
});

describe("product limit guard", () => {
    test("under limit → null, at limit → message", async () => {
        const user = await User.create({
            name: "T",
            email: "limit@t.com",
            password: "x",
            role: "vendor",
            isVerified: true,
        });
        const store = await Store.create({ vendorId: user._id, storeName: "S", subdomain: "limit-shop" });

        expect(await checkProductLimit(store)).toBeNull();

        const docs = [];
        for (let i = 0; i < 20; i++) {
            docs.push({ vendorId: user._id, storeId: store._id, name: `P${i}`, price: 10, stock: 1, description: "d" });
        }
        await Product.insertMany(docs);

        const msg = await checkProductLimit(store);
        expect(msg).toMatch(/Product limit reached/);
    });
});
