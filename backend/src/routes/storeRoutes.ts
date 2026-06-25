import { Router } from "express";
import { updateStoreConfig } from "../controllers/storeController";
import { protect, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.put("/config", protect, authorize("vendor"), updateStoreConfig);

export default router;