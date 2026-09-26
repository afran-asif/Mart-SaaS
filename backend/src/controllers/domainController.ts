import { Response } from "express";
import { randomBytes } from "crypto";
import dns from "dns";
import { Store } from "../models/Store";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { addDomainToVercel, removeDomainFromVercel } from "../utils/vercel";
import { refreshCustomDomainCache } from "../utils/customDomainCache";
import { requirePro } from "../utils/plan";

const DNS_NAME_PATTERN =
    /^(?!-)[a-zA-Z0-9-]{1,63}(?<!-)(\.[a-zA-Z0-9-]{1,63}(?<!-))+$/;

const BASE_DOMAIN = process.env.FRONTEND_BASE_DOMAIN || "localhost:3000";
// বেস ডোমেইনের "hostname" অংশ (port বাদে) — যেমন vendoo.shop
const BASE_HOST = BASE_DOMAIN.split(":")[0];

const isForbiddenDomain = (hostname: string): boolean => {
    const forbidden = [
        "localhost",
        BASE_HOST,
        `www.${BASE_HOST}`,
        "vendoo.shop",
        "www.vendoo.shop",
        "mart-saa-s.vercel.app",
        "www.mart-saa-s.vercel.app",
    ];
    if (forbidden.includes(hostname)) return true;
    // vendor-এর নিজস্ব subdomain.gusu o platform main domain redeem করা যাবে না
    for (const base of [BASE_HOST, "vendoo.shop", "mart-saa-s.vercel.app", "localhost"]) {
        if (hostname === base || hostname.endsWith(`.${base}`)) return true;
    }
    return false;
};

const normalizeDomain = (raw: string): string => {
    let value = raw.trim().toLowerCase();
    // https:// বা http:// prefix থাকলে বাদ
    value = value.replace(/^https?:\/\//, "");
    // trailing slash বাদ
    value = value.replace(/\/+$/, "");
    return value;
};

const checkTxtVerification = (domain: string, code: string): Promise<boolean> => {
    return new Promise((resolve) => {
        dns.resolveTxt(domain, (err, records) => {
            if (err) {
                resolve(false);
                return;
            }
            const flat = records.flat().map((v) => v.trim());
            const expected = `vendoo-verify=${code}`;
            resolve(flat.includes(expected));
        });
    });
};

// ১) কাস্টম ডোমেইন রিকোয়েস্ট — ফরম্যাট চেক + কোড জেনারেট + pending সেভ
export const requestCustomDomain = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const vendorId = req.user._id;
        const raw = (req.body?.domain as string) || "";
        const hostname = normalizeDomain(raw);

        if (!DNS_NAME_PATTERN.test(hostname)) {
            res.status(400).json({ message: "Invalid domain format. Use e.g. shop.example.com" });
            return;
        }

        if (isForbiddenDomain(hostname)) {
            res.status(400).json({ message: "This domain cannot be used. Choose your own registered domain." });
            return;
        }

        const store = await Store.findOne({ vendorId });
        if (!store) {
            res.status(404).json({ message: "Store not found for this vendor" });
            return;
        }

        // 🌐 Custom domain শুধু Pro-তে
        if (!requirePro(store, res, "Custom domain")) return;

        // নিজের subdomain URL (af-gadgets-2.vendoo.shop) নিজে আবার বাঁধা যাবে না
        if (hostname === `${store.subdomain}.${BASE_HOST}`) {
            res.status(400).json({ message: "This is your own vanilla URL. Please use a different custom domain." });
            return;
        }

        // অন্য store-এ ইতিমধ্যে verified/used কিনা
        const existing = await Store.findOne({ customDomain: hostname }).select("_id");
        if (existing && existing._id.toString() !== store._id.toString()) {
            res.status(400).json({ message: "This domain is already connected to another store." });
            return;
        }

        const verificationCode = `vd_${randomBytes(6).toString("hex")}`;
        store.customDomain = hostname;
        store.customDomainStatus = "pending";
        store.customDomainVerificationCode = verificationCode;
        await store.save();

        res.status(200).json({
            success: true,
            customDomain: store.customDomain,
            customDomainStatus: store.customDomainStatus,
            verificationCode,
            cnameTarget: `${store.subdomain}.${BASE_HOST}`,
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// ২) DNS চেক করে verify
export const verifyCustomDomain = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const vendorId = req.user._id;
        const store = await Store.findOne({ vendorId });

        if (!store) {
            res.status(404).json({ message: "Store not found for this vendor" });
            return;
        }

        if (!store.customDomain || !store.customDomainVerificationCode) {
            res.status(400).json({ message: "No pending custom domain found. Connect one first." });
            return;
        }

        const verified = await checkTxtVerification(store.customDomain, store.customDomainVerificationCode);

        if (verified) {
            store.customDomainStatus = "verified";
            await store.save();
            await refreshCustomDomainCache();

            // Vercel-এ domain auto-add (non-blocking — fail হলেও verify সফল থাকবে)
// fail হলে platform owner backend log-এ দেখবে, vendor-কে raw error দেখানো হবে না
            const vercel = await addDomainToVercel(store.customDomain);
            if (!vercel.ok && !vercel.skipped) {
                console.error(`[VERCEL] Failed to auto-add ${store.customDomain}: ${vercel.message}`);
            }

            res.status(200).json({
                success: true,
                customDomain: store.customDomain,
                customDomainStatus: "verified",
                vercelAdded: vercel.ok,
                vercelMessage: vercel.message,
            });
            return;
        }

        store.customDomainStatus = "failed";
        await store.save();
        res.status(400).json({
            success: false,
            message:
                "DNS record not found yet. Add the TXT record on your DNS provider and wait a few minutes, then try again.",
            customDomain: store.customDomain,
            customDomainStatus: "failed",
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// ৩) কাস্টম ডোমেইন মুছে ফেলা
export const removeCustomDomain = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const vendorId = req.user._id;
        const store = await Store.findOne({ vendorId });

        if (!store) {
            res.status(404).json({ message: "Store not found for this vendor" });
            return;
        }

        const domainToRemove = store.customDomain;

        store.customDomain = null;
        store.customDomainStatus = "none";
        store.customDomainVerificationCode = null;
        await store.save();
        await refreshCustomDomainCache();

        // Vercel থেকেও domain সরানো (non-blocking)
        let vercelMessage: string | undefined;
        if (domainToRemove) {
            const vercel = await removeDomainFromVercel(domainToRemove);
            vercelMessage = vercel.message;
        }

        res.status(200).json({
            success: true,
            customDomain: null,
            customDomainStatus: "none",
            vercelMessage,
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};