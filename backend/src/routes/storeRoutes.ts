import { Router } from "express";
import { updateStoreConfig, getMyStore, getAllActiveStores, uploadStoreLogo, uploadHeroImage } from "../controllers/storeController";
import { protect, authorize } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/uploadMiddleware";

const router = Router();

router.get("/all", getAllActiveStores);
router.get("/config", protect, authorize("vendor"), getMyStore);
router.put("/config", protect, authorize("vendor"), updateStoreConfig);
router.post("/logo", protect, authorize("vendor"), upload.single("logo"), uploadStoreLogo);
router.post("/hero-image", protect, authorize("vendor"), upload.single("heroImage"), uploadHeroImage);

export default router;