import { Router } from "express";
import { updateStoreConfig, getMyStore, getAllActiveStores } from "../controllers/storeController";
import { protect, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.get("/all", getAllActiveStores);
router.get("/config", protect, authorize("vendor"), getMyStore);
router.put("/config", protect, authorize("vendor"), updateStoreConfig);

export default router;