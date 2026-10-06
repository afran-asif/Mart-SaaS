import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { User } from "../src/models/User";
import { Store } from "../src/models/Store";
import { Subscription } from "../src/models/Subscription";
import { sendTrialReminders } from "../src/jobs/trialReminders";
import type { TrialReminderData } from "../src/utils/sendEmail";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("trial reminders", () => {
    let vendorId: any;
    const sent: TrialReminderData[] = [];
    const stubSend = jest.fn(async (d: TrialReminderData) => {
        sent.push(d);
    });

    beforeEach(async () => {
        sent.length = 0;
        stubSend.mockClear();
        const t = Date.now();
        const user = await User.create({ name: "V", email: `tr${t}@t.com`, password: "x", role: "vendor", isVerified: true });
        vendorId = user._id;
    });

    const makeTrialStore = (suffix: string, expiresInDays: number, overrides: Record<string, unknown> = {}) =>
        Store.create({
            vendorId,
            storeName: `TR${suffix}`,
            subdomain: `tr${Date.now()}${suffix}`,
            plan: "pro",
            planExpiresAt: new Date(Date.now() + expiresInDays * DAY_MS),
            ...overrides,
        });

    test("2 days left → 3-day reminder once", async () => {
        await makeTrialStore("a", 2);
        const s = await sendTrialReminders(stubSend as any);
        expect(s).toMatchObject({ checked: 1, sent3d: 1 });
        expect(sent).toHaveLength(1);
        expect(sent[0].daysLeft).toBe(2);
        const again = await sendTrialReminders(stubSend as any);
        expect(again.sent3d).toBe(0);
        expect(sent).toHaveLength(1);
    });

    test("12 hours left → 1-day reminder", async () => {
        await makeTrialStore("b", 0.5);
        const s = await sendTrialReminders(stubSend as any);
        expect(s.sent1d).toBe(1);
        expect(sent[0].daysLeft).toBe(1);
    });

    test("expired yesterday → expired notice", async () => {
        await makeTrialStore("c", -1);
        const s = await sendTrialReminders(stubSend as any);
        expect(s.sentExpired).toBe(1);
        expect(sent[0].daysLeft).toBe(0);
    });

    test("10 days left → nothing", async () => {
        await makeTrialStore("d", 10);
        const s = await sendTrialReminders(stubSend as any);
        expect(s).toMatchObject({ sent3d: 0, sent1d: 0, sentExpired: 0 });
        expect(sent).toHaveLength(0);
    });

    test("paid subscription → skipped (not trial)", async () => {
        const store: any = await makeTrialStore("e", 2);
        await Subscription.create({
            vendorId,
            storeId: store._id,
            plan: "pro",
            status: "active",
            amount: 499,
            trxId: "TRX1",
            senderNumber: "0171",
        });
        const s = await sendTrialReminders(stubSend as any);
        expect(s.skipped).toBe(1);
        expect(sent).toHaveLength(0);
    });

    test("free plan store → not picked up", async () => {
        await Store.create({
            vendorId,
            storeName: "TRF",
            subdomain: `trf${Date.now()}`,
            plan: "free",
            planExpiresAt: null,
        });
        const s = await sendTrialReminders(stubSend as any);
        expect(s.checked).toBe(0);
        expect(sent).toHaveLength(0);
    });
});
