import { Router } from "express";
import {
    listStores,
    setStorePlan,
    setStoreStatus,
    listAllOrders,
    getPlatformStats,
    impersonateVendor,
} from "../controllers/adminController";
import { protect, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.use(protect, authorize("super-admin"));

router.get("/stores", listStores);
router.patch("/stores/:id/plan", setStorePlan);
router.patch("/stores/:id/status", setStoreStatus);
router.get("/orders", listAllOrders);
router.get("/stats", getPlatformStats);
router.post("/stores/:id/impersonate", impersonateVendor);

export default router;