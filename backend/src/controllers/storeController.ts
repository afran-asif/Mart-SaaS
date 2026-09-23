import { Request, Response } from "express";
import { Store } from "../models/Store";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { TenantRequest } from "../middlewares/tenantMiddleware";
import { encrypt } from "../utils/encryption";
import { uploadToCloudinary, deleteFromCloudinary } from "../middlewares/uploadMiddleware";

export const getAllActiveStores = async (_req: Request, res: Response): Promise<void> => {
    try {
        const stores = await Store.find({ status: "active" }).select("subdomain storeName updatedAt");

        res.status(200).json({
            success: true,
            count: stores.length,
            stores: stores.map((store) => ({
                id: store._id,
                subdomain: store.subdomain,
                storeName: store.storeName,
                updatedAt: store.updatedAt,
            })),
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const updateStoreConfig = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { 
            storeName, 
            logo, 
            status, 
            useOwnSSLCommerz, 
            sslcommerzStoreId, 
            sslcommerzStorePassword,
            facebookPixelId,
            googleAnalyticsId,
            tiktokPixelId,
        } = req.body;
        const vendorId = req.user._id;

        let store = await Store.findOne({ vendorId }).select('+sslcommerzStorePassword');

        if (!store) {
            res.status(404).json({ message: "Store not found for this vendor"})
            return;
        }

        if (storeName) store.storeName = storeName;
        if (logo !== undefined) store.logo = logo || null;
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

        // ✅ Pixel IDs — খালি স্ট্রিং দিলে মুছে ফেলা যাবে (null করে), না দিলে অপরিবর্তিত
        if (facebookPixelId !== undefined) store.facebookPixelId = facebookPixelId || null;
        if (googleAnalyticsId !== undefined) store.googleAnalyticsId = googleAnalyticsId || null;
        if (tiktokPixelId !== undefined) store.tiktokPixelId = tiktokPixelId || null;

        // Logo বদলালে/মুছলে পুরনো Cloudinary ইমেজ auto-delete (orphan জমবে না)
        let oldLogoToDelete: string | null = null;
        if (logo !== undefined) {
            const newLogo = logo || null;
            if (store.logo && store.logo !== newLogo) {
                oldLogoToDelete = store.logo;
            }
            store.logo = newLogo;
        }

        await store.save();

        if (oldLogoToDelete) {
            deleteFromCloudinary(oldLogoToDelete);
        }

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
                facebookPixelId: store.facebookPixelId,
                googleAnalyticsId: store.googleAnalyticsId,
                tiktokPixelId: store.tiktokPixelId,
                updatedAt: store.updatedAt,
            }
        });
    } catch(error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// Store logo upload (vendor) — multer single file + Cloudinary
export const uploadStoreLogo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const file = (req as any).file as Express.Multer.File | undefined;

        if (!file) {
            res.status(400).json({ message: "Please select an image file to upload." });
            return;
        }

        const vendorId = req.user._id;
        const store = await Store.findOne({ vendorId });

        if (!store) {
            res.status(404).json({ message: "Store not found for this vendor" });
            return;
        }

        const logoUrl = await uploadToCloudinary(file.path);
        const oldLogo = store.logo;
        store.logo = logoUrl;
        await store.save();

        // পুরনো logo Cloudinary থেকে auto-delete (orphan জমবে না)
        if (oldLogo && oldLogo !== logoUrl) {
            deleteFromCloudinary(oldLogo);
        }

        res.status(200).json({
            success: true,
            message: "Store logo uploaded successfully",
            logo: logoUrl,
            store: {
                id: store._id,
                storeName: store.storeName,
                subdomain: store.subdomain,
                logo: store.logo,
                status: store.status,
            },
        });
    } catch (error) {
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
                facebookPixelId: store.facebookPixelId,     
                googleAnalyticsId: store.googleAnalyticsId,  
                tiktokPixelId: store.tiktokPixelId,  
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
                facebookPixelId: store.facebookPixelId,
                googleAnalyticsId: store.googleAnalyticsId,
                tiktokPixelId: store.tiktokPixelId,
            },
        });
    } catch (error) {
        res.status(500).json ({ message: (error as Error).message })
    }
};