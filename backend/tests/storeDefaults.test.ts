import { describe, test, expect } from "@jest/globals";
import express from "express";
import request from "supertest";
import authRoutes from "../src/routes/authRoutes";
import { Store } from "../src/models/Store";
import { Product } from "../src/models/Product";
import { Category } from "../src/models/Category";

const app = express();
app.use(express.json());
app.use("/api/v1/auth", authRoutes);

describe("new store default content", () => {
    test("registration seeds hero, categories and demo products", async () => {
        const t = Date.now();
        const r = await request(app).post("/api/v1/auth/register").send({
            name: "V",
            email: `sd${t}@t.com`,
            password: "password123",
            phone: "01712345679",
            storeName: "Sample Store",
            subdomain: `sd${t}`,
        });
        expect(r.status).toBe(201);

        const store = await Store.findOne({ subdomain: `sd${t}` });
        expect(store).toBeTruthy();
        expect(store?.heroTitle).toContain("Sample Store");
        expect(store?.heroSubtitle).toBeTruthy();
        expect(store?.heroImage).toBeTruthy();
        expect(store?.brandColor).toBe("#F4501A");

        const categories = await Category.find({ storeId: store!._id });
        const products = await Product.find({ storeId: store!._id });
        expect(categories.length).toBe(5);
        expect(products.length).toBe(10);
        expect(products.some((p) => p.featured)).toBe(true);
        expect(products.every((p) => p.images.length > 0)).toBe(true);
    });
});
