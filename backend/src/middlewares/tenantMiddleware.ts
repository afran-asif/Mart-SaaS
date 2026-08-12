import { Request, Response, NextFunction } from "express";
import { Store } from "../models/Store";

export interface TenantRequest extends Request {
    storeId?: string;
    store?: any;
}

export const tenantResolver = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const subdomain = req.headers["x-tenant-subdomain"] as string;

        if (!subdomain) {
            res.status(400).json({ message: "X-Tenant-Subdomain header is missing" });
            return;
        }

        const store = await Store.findOne({ subdomain, status: "active" });

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