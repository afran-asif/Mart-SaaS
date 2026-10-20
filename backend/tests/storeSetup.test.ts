import { describe, test, expect, beforeEach } from "@jest/globals";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { User } from "../src/models/User";
import { Store } from "../src/models/Store";
import storeRoutes from "../src/routes/storeRoutes";

const app = express();
app.use(express.json());
app.use("/api/v1/store", storeRoutes);

const sign = (id: string) => jwt.sign({ userId: id }, process.env.JWT_SECRET!);

describe("store setup", () => {
    let token: string;
    let store: any;
    let t: number;

    beforeEach(async () => {
        t = Date.now();
        const user = await User.create({ name: "V", email: `su${t}@t.com`, password: "x", role: "vendor", isVerified: true });
        store = await Store.create({ vendorId: user._id, storeName: "Old Name", subdomain: `su${t}` });
        token = sign(user._id.toString());
    });

    const put = (body: Record<string, unknown>) =>
        request(app).put("/api/v1/store/setup").set("Authorization", `Bearer ${token}`).send(body);

    test("updates store name and subdomain", async () => {
        const r = await put({ storeName: "New Store", subdomain: `ns${t}` });
        expect(r.status).toBe(200);
        expect(r.body.store.storeName).toBe("New Store");
        expect(r.body.store.subdomain).toBe(`ns${t}`);
        const saved = await Store.findById(store._id);
        expect(saved?.subdomain).toBe(`ns${t}`);
    });

    test("same subdomain keeps working", async () => {
        const r = await put({ storeName: "Renamed", subdomain: store.subdomain });
        expect(r.status).toBe(200);
        expect(r.body.store.storeName).toBe("Renamed");
    });

    test("taken subdomain → 409", async () => {
        const other = await User.create({ name: "O", email: `ot${t}@t.com`, password: "x", role: "vendor", isVerified: true });
        await Store.create({ vendorId: other._id, storeName: "O", subdomain: `taken${t}` });
        const r = await put({ storeName: "Taken Store", subdomain: `taken${t}` });
        expect(r.status).toBe(409);
    });

    test("reserved subdomain → 400", async () => {
        const r = await put({ storeName: "X", subdomain: "admin" });
        expect(r.status).toBe(400);
    });

    test("invalid subdomain → 400", async () => {
        const r = await put({ storeName: "X", subdomain: "ab" });
        expect(r.status).toBe(400);
    });

    test("allows at most 3 subdomain changes", async () => {
        for (let i = 1; i <= 3; i++) {
            const r = await put({ storeName: "Limit Store", subdomain: `lim${t}-${i}` });
            expect(r.status).toBe(200);
        }
        const blocked = await put({ storeName: "Limit Store", subdomain: `lim${t}-4` });
        expect(blocked.status).toBe(403);
        expect(blocked.body.limitReached).toBe(true);
        const saved = await Store.findById(store._id);
        expect(saved?.subdomainChanges).toBe(3);
    });

    test("same subdomain does not count as change", async () => {
        await put({ storeName: "Limit Store", subdomain: `once${t}` });
        await put({ storeName: "Renamed Only", subdomain: `once${t}` });
        const saved = await Store.findById(store._id);
        expect(saved?.subdomainChanges).toBe(1);
    });

    test("requires auth", async () => {
        const r = await request(app).put("/api/v1/store/setup").send({ storeName: "X", subdomain: `noauth${t}` });
        expect(r.status).toBe(401);
    });
});
