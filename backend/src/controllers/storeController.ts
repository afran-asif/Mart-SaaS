import { Response } from "express";
import { Store } from "../models/Store";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { TenantRequest } from "../middlewares/tenantMiddleware";
import { encrypt } from "../utils/encryption";

export const updateStoreConfig = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { 
            storeName, 
            logo, 
            status, 
            useOwnSSLCommerz, 
            sslcommerzStoreId, 
            sslcommerzStorePassword 
        } = req.body;
        const vendorId = req.user._id;

        let store = await Store.findOne({ vendorId }).select('+sslcommerzStorePassword');

        if (!store) {
            res.status(404).json({ message: "Store not found for this vendor"})
            return;
        }

        if (storeName) store.storeName = storeName;
        if (logo) store.logo = logo;
        if (status) store.status = status;

                // --- Hybrid SSLCommerz logic শুরু ---
        if (typeof useOwnSSLCommerz === "boolean") {
            // vendor যদি নিজের SSLCommerz চালু করতে চায়
            if (useOwnSSLCommerz) {
                // নতুন Store ID দিলে সেটা আপডেট করো
                if (sslcommerzStoreId) {
                    store.sslcommerzStoreId = sslcommerzStoreId;
                }
                // নতুন password দিলে encrypt করে সেভ করো
                // password ফাঁকা রাখলে (edit না করলে) আগেরটাই থেকে যাবে
                if (sslcommerzStorePassword) {
                    store.sslcommerzStorePassword = encrypt(sslcommerzStorePassword);
                }

                // চেক করো — চালু করার আগে অন্তত একবার credentials থাকতেই হবে
                if (!store.sslcommerzStoreId || !store.sslcommerzStorePassword) {
                    res.status(400).json({
                        message: "Please provide both SSLCommerz Store ID and Password to enable this option."
                    });
                    return;
                }
            }
            store.useOwnSSLCommerz = useOwnSSLCommerz;
        }
        // --- Hybrid SSLCommerz logic শেষ ---

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
                useOwnSSLCommerz: store.useOwnSSLCommerz,
                sslcommerzStoreId: store.sslcommerzStoreId,
                updatedAt: store.updatedAt,
            }
        });
    } catch(error) {
        res.status(500).json({ message: (error as Error).message });
    }
};



export const getTenantStoreInfo = async (req: TenantRequest, res: Response): Promise<void> => {
    try {
        const store = req.store;

        if (!store) {
            res.status(404).json({ message: "Store not found" });
            return;
        }

        res.status(200).json({
            success: true,
            store: {
                id: store._id,
                storeName: store.storeName,
                subdomain: store.subdomain,
                logo: store.logo,
            }
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getMyStore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const vendorId = req.user._id;
        const store = await Store.findOne({vendorId});

        if (!store) {
            res.status(404).json({ message: "Store not found for this vendor"});
            return;
        }

        res.status(200).json({
            success: true,
            store: {
                id: store._id,
                storeName: store.storeName,
                subdomain: store.subdomain,
                logo: store.logo,
                status: store.status,
                useOwnSSLCommerz: store.useOwnSSLCommerz,
                sslcommerzStoreId: store.sslcommerzStoreId,        
            },
        });
    } catch (error) {
        res.status(500).json ({ message: (error as Error).message })
    }
};