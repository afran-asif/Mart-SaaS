import { describe, test, expect } from "@jest/globals";
import express from "express";
import request from "supertest";
import { originCheck } from "../src/middlewares/originCheck";

const buildApp = () => {
    const app = express();
    app.use(express.json());
    app.use("/api/", originCheck);
    app.post("/api/test", (_req, res) => res.json({ ok: true }));
    app.get("/api/test", (_req, res) => res.json({ ok: true }));
    return app;
};

describe("originCheck (CSRF)", () => {
    const app = buildApp();

    test("evil origin POST → 403", async () => {
        const r = await request(app).post("/api/test").set("Origin", "https://evil.com").send({});
        expect(r.status).toBe(403);
    });

    test("platform origin POST → passes", async () => {
        const r = await request(app).post("/api/test").set("Origin", "https://mart-saa-s.vercel.app").send({});
        expect(r.status).toBe(200);
    });

    test("localhost origin POST → passes", async () => {
        const r = await request(app).post("/api/test").set("Origin", "http://localhost:3000").send({});
        expect(r.status).toBe(200);
    });

    test("no origin (server-to-server) → passes", async () => {
        const r = await request(app).post("/api/test").send({});
        expect(r.status).toBe(200);
    });

    test("GET not checked even with evil origin", async () => {
        const r = await request(app).get("/api/test").set("Origin", "https://evil.com");
        expect(r.status).toBe(200);
    });
});
