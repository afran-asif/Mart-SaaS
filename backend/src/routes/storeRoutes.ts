import { Router } from "express";
import { updateStoreConfig, getMyStore, getAllActiveStores, uploadStoreLogo } from "../controllers/storeController";
import { protect, authorize } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/uploadMiddleware";

const router = Router();

router.get("/all", getAllActiveStores);
router.get("/config", protect, authorize("vendor"), getMyStore);
router.put("/config", protect, authorize("vendor"), updateStoreConfig);
router.post("/logo", protect, authorize("vendor"), upload.single("logo"), uploadStoreLogo);

export default router;