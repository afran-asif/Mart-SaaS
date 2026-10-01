import { Request, Response, NextFunction } from "express";
import { Store } from "../models/Store";
import { cacheGet, cacheSet, cacheKeys, TTL } from "../utils/cache";

export interface TenantRequest extends Request {
    storeId?: string;
    store?: any;
}

const BASE_DOMAIN = process.env.FRONTEND_BASE_DOMAIN || "localhost:3000";
const BASE_HOST = BASE_DOMAIN.split(":")[0];

// identifier একটা full custom domain কিনা (বেস ডোমেইনের subdomain না)
const isCustomDomainIdentifier = (id: string): boolean => {
    if (!id.includes(".")) return false;
    if (id.includes(":")) return false; // localhost:3000 ইত্যাদি
    return !(id === BASE_HOST || id.endsWith(`.${BASE_HOST}`));
};

// store resolution with Redis cache (miss → DB → cache 5 min)
const resolveStore = async (filter: Record<string, unknown>, identifier: string): Promise<any> => {
    const key = cacheKeys.tenantStore(identifier);
    const cached = await cacheGet<any>(key);
    if (cached) {
        return Store.hydrate(cached);
    }
    const store = await Store.findOne(filter);
    if (store) {
        await cacheSet(key, store.toObject(), TTL.TENANT_STORE);
    }
    return store;
};

export const tenantResolver = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const identifier = (req.headers["x-tenant-subdomain"] as string || "")
            .trim()
            .toLowerCase()
            .replace(/^www\./, "");

        if (!identifier) {
            res.status(400).json({ message: "X-Tenant-Subdomain header is missing" });
            return;
        }

        const store = isCustomDomainIdentifier(identifier)
            ? await resolveStore({ customDomain: identifier, customDomainStatus: "verified", status: "active" }, identifier)
            : await resolveStore({ subdomain: identifier, status: "active" }, identifier);

        if (!store) {
            res.status(404).json({ message: "Requested store or tenant not found or inactive"});
            return;
        }

        req.storeId = store._id.toString();
        req.store = store;

        next();
    } catch (error) {
        res.status(500).json({ message: (error as Error).message })
    };
};
