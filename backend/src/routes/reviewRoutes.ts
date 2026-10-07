import { Router } from "express";
import { getVendorReviews, toggleReviewVisibility, deleteReview } from "../controllers/reviewController";
import { protect, authorize } from "../middlewares/authMiddleware";
import { requireActivePlan } from "../middlewares/planGate";

const router = Router();

router.get("/", protect, authorize("vendor", "super-admin"), requireActivePlan, getVendorReviews);
router.patch("/:id/visibility", protect, authorize("vendor", "super-admin"), requireActivePlan, toggleReviewVisibility);
router.delete("/:id", protect, authorize("vendor", "super-admin"), requireActivePlan, deleteReview);

export default router;