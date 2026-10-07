import { Router } from "express";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon } from "../controllers/couponController";
import { protect, authorize } from "../middlewares/authMiddleware";
import { requireActivePlan } from "../middlewares/planGate";
import { tenantResolver } from "../middlewares/tenantMiddleware";

const router = Router();

// tenant public validate
router.get("/validate", tenantResolver, validateCoupon);
router.post("/validate", tenantResolver, validateCoupon);

// vendor CRUD
router.route("/")
    .get(protect, authorize("vendor", "super-admin"), requireActivePlan, getCoupons)
    .post(protect, authorize("vendor", "super-admin"), requireActivePlan, createCoupon);

router.route("/:id")
    .put(protect, authorize("vendor", "super-admin"), requireActivePlan, updateCoupon)
    .delete(protect, authorize("vendor", "super-admin"), requireActivePlan, deleteCoupon);

export default router;