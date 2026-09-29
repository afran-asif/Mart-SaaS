import { describe, test, expect } from "@jest/globals";
import { getDeliveryCharge, BD_DISTRICTS, BD_DISTRICT_THANAS, isValidThana } from "../src/utils/deliveryCharges";

describe("delivery charges", () => {
    test("65 districts present", () => {
        expect(BD_DISTRICTS).toHaveLength(65);
    });

    test("every district has a thana list", () => {
        for (const d of BD_DISTRICTS) {
            expect(BD_DISTRICT_THANAS[d]?.length).toBeGreaterThan(0);
        }
    });

    test("dhaka city = 70", () => {
        expect(getDeliveryCharge("Dhaka")).toBe(70);
    });

    test("dhaka sub-urban = 105", () => {
        expect(getDeliveryCharge("Dhaka Sub-Urban")).toBe(105);
    });

    test("outside = 130", () => {
        for (const d of ["Chittagong", "Sylhet", "Rangpur", "Khulna", "Barishal", "Rajshahi", "Coxs Bazar"]) {
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

describe("thana validation", () => {
    test("valid thana passes", () => {
        expect(isValidThana("Dhaka", "Mirpur")).toBe(true);
        expect(isValidThana("Dhaka Sub-Urban", "Savar")).toBe(true);
        expect(isValidThana("Chittagong", "Patenga")).toBe(true);
    });

    test("wrong-district thana fails", () => {
        expect(isValidThana("Dhaka", "Savar")).toBe(false);
        expect(isValidThana("Sylhet", "Mirpur")).toBe(false);
    });

    test("empty values fail", () => {
        expect(isValidThana("", "Mirpur")).toBe(false);
        expect(isValidThana("Dhaka", "")).toBe(false);
        expect(isValidThana(undefined, undefined)).toBe(false);
    });
});
