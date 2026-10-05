import { Request, Response } from "express";
import { Store } from "../models/Store";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { TenantRequest } from "../middlewares/tenantMiddleware";
import { encrypt } from "../utils/encryption";
import { uploadToCloudinary, deleteFromCloudinary } from "../middlewares/uploadMiddleware";
import { getEffectivePlan, getPlanLimits } from "../utils/plan";
import { cacheDelTenantStore } from "../utils/cache";

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
            facebookUrl,
            instagramUrl,
            whatsappNumber,
            steadfastApiKey,
            steadfastSecretKey,
            contactEmail,
            contactPhone,
            address,
            brandColor,
            heroTitle,
            heroSubtitle,
            heroImage,
            theme,
        } = req.body;
        const vendorId = req.user._id;

        let store = await Store.findOne({ vendorId }).select('+sslcommerzStorePassword +steadfastApiKey +steadfastSecretKey');

        if (!store) {
            res.status(404).json({ message: "Store not found for this vendor"})
            return;
        }

        if (storeName) store.storeName = storeName;
        if (logo !== undefined) store.logo = logo || null;
        if (status) store.status = status;

        // 💳 Plan limits — proLocked ফিল্ডগুলো free-তে সেভ হবে না (আগের মান বহাল থাকবে)
        const plan = getEffectivePlan(store);
        const limits = await getPlanLimits(plan);
        const proLocked: string[] = [];

                // --- Hybrid SSLCommerz logic শুরু ---
        // নিজের gateway নতুন করে চালু করা শুধু Pro-তে (আগে থেকে চালু থাকলে grandfathered)
        if (useOwnSSLCommerz === true && !store.useOwnSSLCommerz && plan !== "pro") {
            res.status(403).json({ message: "Own SSLCommerz gateway is a Pro feature. Please upgrade your plan.", proRequired: true });
            return;
        }
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

        // ✅ Pixel IDs — শুধু Pro-তে নতুন করে বসানো যাবে (খালি করা সবসময় যাবে)
        const pixelFields = [
            ["facebookPixelId", facebookPixelId],
            ["googleAnalyticsId", googleAnalyticsId],
            ["tiktokPixelId", tiktokPixelId],
        ] as const;
        for (const [key, value] of pixelFields) {
            if (value === undefined) continue;
            const v = String(value ?? "").trim();
            if (v && !(store as any)[key] && !limits.pixels) {
                proLocked.push("pixels");
                continue;
            }
            (store as any)[key] = v || null;
        }

        // ✅ Social links + contact info — খালি স্ট্রিং দিলে মুছে ফেলা যাবে (null করে)
        if (facebookUrl !== undefined) store.facebookUrl = facebookUrl || null;
        if (instagramUrl !== undefined) store.instagramUrl = instagramUrl || null;
        if (whatsappNumber !== undefined) store.whatsappNumber = whatsappNumber || null;
        if (contactEmail !== undefined) store.contactEmail = contactEmail || null;
        if (contactPhone !== undefined) store.contactPhone = contactPhone || null;
        if (address !== undefined) store.address = address || null;

        // 🚚 Steadfast keys — encrypted save, খালি দিলে মুছে ফেলা (null)
        // ENCRYPTION_KEY ছাড়া key সেভ করা যাবে না (plaintext secret রাখা নিষেধ)
        if (steadfastApiKey !== undefined || steadfastSecretKey !== undefined) {
            if (!process.env.ENCRYPTION_KEY) {
                res.status(400).json({ message: "ENCRYPTION_KEY is not configured on the server. Courier keys cannot be saved securely." });
                return;
            }
            if (steadfastApiKey !== undefined) {
                store.steadfastApiKey = steadfastApiKey ? encrypt(String(steadfastApiKey).trim()) : null;
            }
            if (steadfastSecretKey !== undefined) {
                store.steadfastSecretKey = steadfastSecretKey ? encrypt(String(steadfastSecretKey).trim()) : null;
            }
        }

        // ✅ Branding & hero — null-safe (frontend খালি field null পাঠায়)
        const toNullString = (v: unknown): string | null => {
            if (v === undefined || v === null) return null;
            const s = String(v).trim();
            return s || null;
        };
        if (brandColor !== undefined) {
            store.brandColor = toNullString(brandColor);
        }
        if (heroTitle !== undefined) store.heroTitle = toNullString(heroTitle);
        if (heroSubtitle !== undefined) store.heroSubtitle = toNullString(heroSubtitle);
        if (heroImage !== undefined) store.heroImage = toNullString(heroImage);
        if (theme !== undefined) {
            const allowed: string[] = limits.themes.length
                ? [...limits.themes]
                : ["classic", "minimal", "bold", "elegant", "vibrant", "retro", "luxe", "pastel", "urban"];
            const v = String(theme ?? "").trim().toLowerCase();
            if (allowed.includes(v)) {
                store.theme = v;
            } else if (v !== store.theme) {
                proLocked.push(`theme:${v}`);
            }
        }

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
        await cacheDelTenantStore(store.subdomain, store.customDomain);

        if (oldLogoToDelete) {
            deleteFromCloudinary(oldLogoToDelete);
        }

        res.status(200).json({
            success: true,
            message: "Store configuaration updated successfully",
            proLocked: [...new Set(proLocked)],
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
                facebookUrl: store.facebookUrl,
                instagramUrl: store.instagramUrl,
                whatsappNumber: store.whatsappNumber,
                steadfastConnected: !!(store.steadfastApiKey && store.steadfastSecretKey),
                contactEmail: store.contactEmail,
                contactPhone: store.contactPhone,
                address: store.address,
                brandColor: store.brandColor,
                heroTitle: store.heroTitle,
                heroSubtitle: store.heroSubtitle,
                heroImage: store.heroImage,
                theme: store.theme,
                customDomain: store.customDomain,
                customDomainStatus: store.customDomainStatus,
                customDomainVerificationCode: store.customDomainVerificationCode,
                plan: getEffectivePlan(store),
                planExpiresAt: store.planExpiresAt,
                updatedAt: store.updatedAt,
            }
        });
    } catch(error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const uploadHeroImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
        const heroUrl = await uploadToCloudinary(file.path, "vendoo-store", [{ width: 1920, crop: "limit", quality: "auto", fetch_format: "auto" }]);
        const oldHero = store.heroImage;
        store.heroImage = heroUrl;
        await store.save();
        await cacheDelTenantStore(store.subdomain, store.customDomain);
        if (oldHero && oldHero !== heroUrl) {
            deleteFromCloudinary(oldHero);
        }
        res.status(200).json({
            success: true,
            message: "Hero image uploaded successfully",
            heroImage: heroUrl,
            store: {
                id: store._id,
                storeName: store.storeName,
                subdomain: store.subdomain,
                heroImage: store.heroImage,
            },
        });
    } catch (error) {
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

        const logoUrl = await uploadToCloudinary(file.path, "vendoo-store", [{ width: 400, crop: "limit", quality: "auto", fetch_format: "auto" }]);
        const oldLogo = store.logo;
        store.logo = logoUrl;
        await store.save();
        await cacheDelTenantStore(store.subdomain, store.customDomain);

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

        // 💳 Pro শেষ হলে storefront-এ: pixels বন্ধ, pro theme → classic, online payment বন্ধ
        // (products ও custom domain চালু থাকে — live দোকান ভাঙে না)
        const tenantPlan = getEffectivePlan(store);
        const tenantLimits = await getPlanLimits(tenantPlan);
        const themeAllowed = !tenantLimits.themes.length || tenantLimits.themes.includes(store.theme);

        res.status(200).json({
            success: true,
            store: {
                id: store._id,
                storeName: store.storeName,
                subdomain: store.subdomain,
                logo: store.logo,
                facebookPixelId: tenantLimits.pixels ? store.facebookPixelId : null,
                googleAnalyticsId: tenantLimits.pixels ? store.googleAnalyticsId : null,
                tiktokPixelId: tenantLimits.pixels ? store.tiktokPixelId : null,
                facebookUrl: store.facebookUrl,
                instagramUrl: store.instagramUrl,
                whatsappNumber: store.whatsappNumber,
                contactEmail: store.contactEmail,
                contactPhone: store.contactPhone,
                address: store.address,
                brandColor: store.brandColor,
                heroTitle: store.heroTitle,
                heroSubtitle: store.heroSubtitle,
                heroImage: store.heroImage,
                theme: themeAllowed ? store.theme : "classic",
                onlinePaymentEnabled: tenantPlan === "pro" && !!store.useOwnSSLCommerz && !!store.sslcommerzStoreId,
                // Pro-তে "Powered by Vendoo" badge লুকানো যাবে
                plan: tenantPlan,
            }
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getMyStore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const vendorId = req.user._id;
        const store = await Store.findOne({vendorId}).select('+steadfastApiKey +steadfastSecretKey');

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
                facebookUrl: store.facebookUrl,
                instagramUrl: store.instagramUrl,
                whatsappNumber: store.whatsappNumber,
                steadfastConnected: !!(store.steadfastApiKey && store.steadfastSecretKey),
                contactEmail: store.contactEmail,
                contactPhone: store.contactPhone,
                address: store.address,
                brandColor: store.brandColor,
                heroTitle: store.heroTitle,
                heroSubtitle: store.heroSubtitle,
                heroImage: store.heroImage,
                theme: store.theme,
                customDomain: store.customDomain,
                customDomainStatus: store.customDomainStatus,
                customDomainVerificationCode: store.customDomainVerificationCode,
                plan: getEffectivePlan(store),
                planExpiresAt: store.planExpiresAt,
            },
        });
    } catch (error) {
        res.status(500).json ({ message: (error as Error).message })
    }
};