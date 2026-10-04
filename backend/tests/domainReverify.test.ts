import { describe, test, expect, beforeEach } from "@jest/globals";
import { User } from "../src/models/User";
import { Store } from "../src/models/Store";
import { reverifyCustomDomains, REVERIFY_FAIL_LIMIT } from "../src/jobs/reverifyCustomDomains";

describe("custom domain periodic re-verify", () => {
    let vendorId: any;

    beforeEach(async () => {
        const t = Date.now();
        const user = await User.create({ name: "V", email: `rv${t}@t.com`, password: "x", role: "vendor", isVerified: true });
        vendorId = user._id;
    });

    const makeStore = (suffix: string, overrides: Record<string, unknown> = {}) =>
        Store.create({
            vendorId,
            storeName: `RS${suffix}`,
            subdomain: `rv${Date.now()}${suffix}`,
            customDomain: `shop-${suffix}.example.com`,
            customDomainStatus: "verified",
            customDomainVerificationCode: "vd_testcode123",
            ...overrides,
        });

    test("TXT present → stays verified", async () => {
        await makeStore("a");
        const summary = await reverifyCustomDomains(async () => true);
        expect(summary).toMatchObject({ checked: 1, stillOk: 1, revoked: 0 });
        const s = await Store.findOne({ subdomain: /a$/ });
        expect(s?.customDomainStatus).toBe("verified");
    });

    test("TXT missing once → stays verified, counter 1", async () => {
        await makeStore("b");
        const summary = await reverifyCustomDomains(async () => false);
        expect(summary).toMatchObject({ checked: 1, failedOnce: 1, revoked: 0 });
        const s = await Store.findOne({ customDomain: "shop-b.example.com" });
        expect(s?.customDomainStatus).toBe("verified");
        expect(s?.customDomainFailedChecks).toBe(1);
    });

    test(`TXT missing ${REVERIFY_FAIL_LIMIT}x in a row → revoked to failed`, async () => {
        await makeStore("c", { customDomainFailedChecks: REVERIFY_FAIL_LIMIT - 1 });
        const summary = await reverifyCustomDomains(async () => false);
        expect(summary.revoked).toBe(1);
        const s = await Store.findOne({ customDomain: "shop-c.example.com" });
        expect(s?.customDomainStatus).toBe("failed");
        expect(s?.customDomainFailedChecks).toBe(0);
    });

    test("verified store without code → skipped (grandfathered)", async () => {
        await makeStore("d", { customDomainVerificationCode: null });
        const summary = await reverifyCustomDomains(async () => true);
        expect(summary).toMatchObject({ checked: 0, skipped: 1, revoked: 0 });
    });

    test("success resets a stale counter", async () => {
        await makeStore("e", { customDomainFailedChecks: 1 });
        await reverifyCustomDomains(async () => true);
        const s = await Store.findOne({ customDomain: "shop-e.example.com" });
        expect(s?.customDomainFailedChecks).toBe(0);
        expect(s?.customDomainStatus).toBe("verified");
    });
});
