import { Store } from "../models/Store";

// verified custom domain cache — CORS origin check-এর জন্য।
// app startup-এ + 5 মিনিট পরপর + verify/remove-এর সাথে সাথে refresh হয়।
const verifiedCustomDomains = new Set<string>();

export const refreshCustomDomainCache = async (): Promise<void> => {
    try {
        const stores = await Store.find({ customDomainStatus: "verified", status: "active" })
            .select("customDomain")
            .lean();
        verifiedCustomDomains.clear();
        for (const s of stores) {
            if (s.customDomain) verifiedCustomDomains.add(s.customDomain.toLowerCase());
        }
    } catch (error) {
        console.error("[CORS] custom domain cache refresh failed:", (error as Error).message);
    }
};

export const isVerifiedCustomDomain = (host: string): boolean => {
    return verifiedCustomDomains.has(host.toLowerCase());
};