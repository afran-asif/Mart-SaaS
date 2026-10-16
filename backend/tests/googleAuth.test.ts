import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { User } from "../src/models/User";
import { Store } from "../src/models/Store";
import authRoutes from "../src/routes/authRoutes";

const mockVerify = jest.fn() as jest.MockedFunction<any>;
jest.mock("google-auth-library", () => ({
    OAuth2Client: jest.fn().mockImplementation(() => ({ verifyIdToken: mockVerify })),
}));

const app = express();
app.use(express.json());
app.use("/api/v1/auth", authRoutes);

const sign = (id: string) => jwt.sign({ userId: id }, process.env.JWT_SECRET!);

describe("google auth", () => {
    beforeEach(() => {
        process.env.GOOGLE_CLIENT_ID = "test-client-id";
        mockVerify.mockReset();
    });

    const goodToken = (email = "g1@t.com", name = "G User", verified = true) => {
        mockVerify.mockResolvedValue({
            getPayload: () => ({ email, name, email_verified: verified }),
        });
    };

    test("no client id → 500", async () => {
        delete process.env.GOOGLE_CLIENT_ID;
        const r = await request(app).post("/api/v1/auth/google").send({ idToken: "x" });
        expect(r.status).toBe(500);
        process.env.GOOGLE_CLIENT_ID = "test-client-id";
    });

    test("invalid token → 401", async () => {
        mockVerify.mockRejectedValue(new Error("bad"));
        const r = await request(app).post("/api/v1/auth/google").send({ idToken: "bad" });
        expect(r.status).toBe(401);
    });

    test("unverified google email → 401", async () => {
        goodToken("g2@t.com", "G", false);
        const r = await request(app).post("/api/v1/auth/google").send({ idToken: "t" });
        expect(r.status).toBe(401);
    });

    test("existing user → 200 login (no profile needed)", async () => {
        const t = Date.now();
        const user = await User.create({ name: "V", email: `ge${t}@t.com`, password: "x", role: "vendor", isVerified: true });
        await Store.create({ vendorId: user._id, storeName: "S", subdomain: `ge${t}` });
        goodToken(`ge${t}@t.com`);
        const r = await request(app).post("/api/v1/auth/google").send({ idToken: "t" });
        expect(r.status).toBe(200);
        expect(r.body.user.email).toBe(`ge${t}@t.com`);
        expect(r.body.token).toBeTruthy();
    });

    test("new user without profile → 400 needProfile", async () => {
        goodToken("brand-new@t.com");
        const r = await request(app).post("/api/v1/auth/google").send({ idToken: "t" });
        expect(r.status).toBe(400);
        expect(r.body.needProfile).toBe(true);
    });

    test("new user full → 201 with store + trial", async () => {
        const t = Date.now();
        goodToken(`gn${t}@t.com`, "New Guy");
        const r = await request(app).post("/api/v1/auth/google").send({
            idToken: "t",
            phone: "01799998888",
            storeName: "New Store",
            subdomain: `gn${t}`,
        });
        expect(r.status).toBe(201);
        expect(r.body.store.subdomain).toBe(`gn${t}`);
        const store = await Store.findOne({ subdomain: `gn${t}` });
        expect(store?.plan).toBe("pro");
        expect(store?.planExpiresAt).toBeTruthy();
        const me = await User.findOne({ email: `gn${t}@t.com` });
        expect(me?.isVerified).toBe(true);
    });

    test("duplicate phone blocked", async () => {
        const t = Date.now();
        await User.create({ name: "V", email: `gp${t}@t.com`, password: "x", phone: "01611112222", role: "vendor", isVerified: true });
        goodToken(`gp2${t}@t.com`);
        const r = await request(app).post("/api/v1/auth/google").send({
            idToken: "t",
            phone: "01611112222",
            storeName: "S",
            subdomain: `gp${t}`,
        });
        expect(r.status).toBe(400);
        expect(r.body.message).toMatch(/phone/i);
    });

    test("customer role cannot access dashboard", async () => {
        await User.create({ name: "C", email: "cust@t.com", password: "x", role: "customer", isVerified: true });
        goodToken("cust@t.com");
        const r = await request(app).post("/api/v1/auth/google").send({ idToken: "t" });
        expect(r.status).toBe(403);
    });

    test("auth me works with vendor token", async () => {
        const user = await User.create({ name: "V", email: `gm${Date.now()}@t.com`, password: "x", role: "vendor", isVerified: true });
        const tok = sign(user._id.toString());
        const r = await request(app).get("/api/v1/auth/me").set("Authorization", `Bearer ${tok}`);
        expect(r.status).toBe(200);
        expect(r.body.user.email).toBe(user.email);
    });
});
