import { Router } from "express";
import { updateStoreConfig, getMyStore, getAllActiveStores, uploadStoreLogo, uploadHeroImage } from "../controllers/storeController";
import { requestCustomDomain, verifyCustomDomain, removeCustomDomain } from "../controllers/domainController";
import { protect, authorize } from "../middlewares/authMiddleware";
import { requireActivePlan } from "../middlewares/planGate";
import { upload } from "../middlewares/uploadMiddleware";

const router = Router();

router.get("/all", getAllActiveStores);
router.get("/config", protect, authorize("vendor"), requireActivePlan, getMyStore);
router.put("/config", protect, authorize("vendor"), requireActivePlan, updateStoreConfig);
router.post("/logo", protect, authorize("vendor"), requireActivePlan, upload.single("logo"), uploadStoreLogo);
router.post("/hero-image", protect, authorize("vendor"), requireActivePlan, upload.single("heroImage"), uploadHeroImage);

// Custom domain management
router.post("/config/domain/request", protect, authorize("vendor"), requireActivePlan, requestCustomDomain);
router.post("/config/domain/verify", protect, authorize("vendor"), requireActivePlan, verifyCustomDomain);
router.post("/config/domain/remove", protect, authorize("vendor"), requireActivePlan, removeCustomDomain);

export default router;