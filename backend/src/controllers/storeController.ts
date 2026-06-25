import { Response } from "express";
import { Store } from "../models/Store";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const updateStoreConfig = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { storeName, logo, status } = req.body;
        const vendorId = req.user._id;

        let store = await Store.findOne({ vendorId });

        if (!store) {
            res.status(404).json({ message: "Store not found for this vendor"})
            return;
        }

        if (storeName) store.storeName = storeName;
        if (logo) store.logo = logo;
        if (status) store.status = status;

        await store.save();

        res.status(200).json({
            success: true,
            message: "Store configuaration updated successfully",
            store:{
                id: store._id,
                storeName: store.storeName,
                subdomain: store.subdomain,
                logo: store.logo,
                status: store.status,
                updatedAt: store.updatedAt,
            }
        });
    } catch(error) {
        res.status(500).json({ message: (error as Error).message });
    }
};