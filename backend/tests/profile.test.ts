import { describe, test, expect, beforeEach } from "@jest/globals";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { User } from "../src/models/User";
import authRoutes from "../src/routes/authRoutes";

const app = express();
app.use(express.json());
app.use("/api/v1/auth", authRoutes);

const sign = (id: string) => jwt.sign({ userId: id }, process.env.JWT_SECRET!);

describe("profile update", () => {
    let token: string;
    let t: number;

    beforeEach(async () => {
        t = Date.now();
        const user = await User.create({
            name: "Old Name",
            email: `pf${t}@t.com`,
            password: "x",
            role: "vendor",
            isVerified: true,
        });
        token = sign(user._id.toString());
    });

    const put = (body: Record<string, unknown>) =>
        request(app).put("/api/v1/auth/profile").set("Authorization", `Bearer ${token}`).send(body);

    test("updates name and phone", async () => {
        const r = await put({ name: "New Name", phone: "01712345678" });
        expect(r.status).toBe(200);
        expect(r.body.user.name).toBe("New Name");
        expect(r.body.user.phone).toBe("01712345678");
        expect(r.body.user.passwordSet).toBe(true);
    });

    test("empty phone clears it", async () => {
        await put({ name: "N", phone: "01712345678" });
        const r = await put({ name: "N", phone: "" });
        expect(r.status).toBe(200);
        expect(r.body.user.phone).toBeNull();
    });

    test("invalid phone → 400", async () => {
        const r = await put({ name: "N", phone: "12345" });
        expect(r.status).toBe(400);
    });

    test("duplicate phone → 409", async () => {
        await User.create({
            name: "Other",
            email: `pf-other${t}@t.com`,
            password: "x",
            phone: "01812345678",
            role: "vendor",
            isVerified: true,
        });
        const r = await put({ name: "N", phone: "01812345678" });
        expect(r.status).toBe(409);
    });

    test("me includes profile metadata", async () => {
        const r = await request(app).get("/api/v1/auth/me").set("Authorization", `Bearer ${token}`);
        expect(r.status).toBe(200);
        expect(r.body.user.isVerified).toBe(true);
        expect(r.body.user.passwordSet).toBe(true);
        expect(r.body.user.createdAt).toBeTruthy();
    });
});
