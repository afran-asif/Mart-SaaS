import { Router } from "express";
import { updateStoreConfig, getMyStore, getAllActiveStores, uploadStoreLogo, uploadHeroImage } from "../controllers/storeController";
import { requestCustomDomain, verifyCustomDomain, removeCustomDomain } from "../controllers/domainController";
import { protect, authorize } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/uploadMiddleware";

const router = Router();

router.get("/all", getAllActiveStores);
router.get("/config", protect, authorize("vendor"), getMyStore);
router.put("/config", protect, authorize("vendor"), updateStoreConfig);
router.post("/logo", protect, authorize("vendor"), upload.single("logo"), uploadStoreLogo);
router.post("/hero-image", protect, authorize("vendor"), upload.single("heroImage"), uploadHeroImage);

// Custom domain management
router.post("/config/domain/request", protect, authorize("vendor"), requestCustomDomain);
router.post("/config/domain/verify", protect, authorize("vendor"), verifyCustomDomain);
router.post("/config/domain/remove", protect, authorize("vendor"), removeCustomDomain);

export default router;