import { Router } from "express";
import { getVendorReviews, toggleReviewVisibility, deleteReview } from "../controllers/reviewController";
import { protect, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", protect, authorize("vendor", "super-admin"), getVendorReviews);
router.patch("/:id/visibility", protect, authorize("vendor", "super-admin"), toggleReviewVisibility);
router.delete("/:id", protect, authorize("vendor", "super-admin"), deleteReview);

export default router;