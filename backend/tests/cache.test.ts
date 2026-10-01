import { describe, test, expect } from "@jest/globals";
import { cacheGet, cacheSet, cacheDel, cacheDelTenantStore, getCache } from "../src/utils/cache";

describe("cache graceful fallback (no REDIS_URL)", () => {
    test("no client without URL", () => {
        delete process.env.REDIS_URL;
        expect(getCache()).toBeNull();
    });

    test("get/set/del are safe no-ops", async () => {
        await expect(cacheGet("k")).resolves.toBeNull();
        await expect(cacheSet("k", { a: 1 }, 60)).resolves.toBeUndefined();
        await expect(cacheDel("k")).resolves.toBeUndefined();
        await expect(cacheDelTenantStore("sub", "custom.com")).resolves.toBeUndefined();
    });
});
