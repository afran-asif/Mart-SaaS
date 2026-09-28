import { describe, test, expect } from "@jest/globals";
import { getDeliveryCharge, BANGLADESH_DISTRICTS } from "../src/utils/deliveryCharges";

describe("delivery charges", () => {
    test("64 districts present", () => {
        expect(BANGLADESH_DISTRICTS).toHaveLength(64);
    });

    test("dhaka city = 70", () => {
        expect(getDeliveryCharge("ঢাকা")).toBe(70);
    });

    test("sub-urban = 105", () => {
        for (const d of ["গাজীপুর", "নারায়ণগঞ্জ", "টাঙ্গাইল", "শরীয়তপুর"]) {
            expect(getDeliveryCharge(d)).toBe(105);
        }
    });

    test("outside = 130", () => {
        for (const d of ["চট্টগ্রাম", "সিলেট", "রংপুর", "খুলনা", "বরিশাল", "রাজশাহী", "ময়মনসিংহ"]) {
            expect(getDeliveryCharge(d)).toBe(130);
        }
    });

    test("empty/undefined = 0 (not selected yet)", () => {
        expect(getDeliveryCharge("")).toBe(0);
        expect(getDeliveryCharge(undefined)).toBe(0);
    });

    test("unknown district falls back to default", () => {
        expect(getDeliveryCharge("UnknownPlace")).toBe(130);
    });
});
