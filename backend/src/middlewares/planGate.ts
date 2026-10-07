import { Response, NextFunction } from "express";
import { Store } from "../models/Store";
import { AuthenticatedRequest } from "./authMiddleware";
import { isStoreLocked } from "../utils/plan";

// 🔒 Vendor plan gate — locked (expired trial / unpaid) vendor-এর সব store API বন্ধ।
// Billing flow খোলা থাকে: subscription/me, subscription/request (এই middleware ওখানে বসে না)।
// Super-admin + impersonated session bypass করে।
export const requireActivePlan = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = (req as any).user;
        if (!user || user.role !== "vendor" || (req as any).impersonatedBy) {
            next();
            return;
        }
        const store = await Store.findOne({ vendorId: user._id }).select("plan planExpiresAt status");
        if (!store) {
            next();
            return;
        }
        if (store.status !== "active") {
            res.status(403).json({ message: "Store is suspended. Contact support.", suspended: true });
            return;
        }
        if (isStoreLocked(store)) {
            res.status(403).json({
                message: "Your trial has ended. Renew Pro to unlock your store.",
                locked: true,
                proRequired: true,
            });
            return;
        }
        next();
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
