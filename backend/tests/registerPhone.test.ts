import { describe, test, expect } from "@jest/globals";
import express from "express";
import request from "supertest";
import authRoutes from "../src/routes/authRoutes";

const app = express();
app.use(express.json());
// trust proxy → X-Forwarded-For অনুযায়ী rate-limit bucket আলাদা (প্রতি test আলাদা IP)
app.set("trust proxy", 1);
app.use("/api/v1/auth", authRoutes);

let ipCounter = 10;
const withIp = (req: any) => {
    ipCounter += 1;
    return req.set("X-Forwarded-For", `10.9.9.${ipCounter}`);
};

describe("register phone uniqueness (one trial per phone)", () => {
    const base = (over: Record<string, unknown> = {}) => ({
        name: "V",
        email: `ph${Date.now()}@t.com`,
        password: "password123",
        phone: "01712345678",
        storeName: "S",
        subdomain: `ph${Date.now()}`,
        ...over,
    });

    test("missing phone → 400", async () => {
        const b: any = base();
        delete b.phone;
        const r = await withIp(request(app).post("/api/v1/auth/register")).send(b);
        expect(r.status).toBe(400);
    });

    test("invalid phone → 400", async () => {
        const r = await withIp(request(app).post("/api/v1/auth/register")).send(base({ phone: "12345" }));
        expect(r.status).toBe(400);
    });

    test("valid → 201, duplicate phone (new email) → 400", async () => {
        const t = Date.now();
        const r1 = await withIp(request(app).post("/api/v1/auth/register")).send({
            ...base(),
            email: `ph1${t}@t.com`,
            subdomain: `ph1${t}`,
        });
        expect(r1.status).toBe(201);

        const r2 = await withIp(request(app).post("/api/v1/auth/register")).send({
            ...base(),
            email: `ph2${t}@t.com`,
            subdomain: `ph2${t}`,
        });
        expect(r2.status).toBe(400);
        expect(r2.body.message).toMatch(/phone/i);
    });

    test("duplicate email still blocked", async () => {
        const t = Date.now();
        await withIp(request(app).post("/api/v1/auth/register")).send({
            ...base(),
            email: `ph3${t}@t.com`,
            phone: "01811111111",
            subdomain: `ph3${t}`,
        });
        const r = await withIp(request(app).post("/api/v1/auth/register")).send({
            ...base(),
            email: `ph3${t}@t.com`,
            phone: "01922222222",
            subdomain: `ph4${t}`,
        });
        expect(r.status).toBe(400);
    });
});
