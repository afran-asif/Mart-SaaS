import { Router } from "express";
import {
    getMySubscription,
    requestSubscription,
    listSubscriptionRequests,
    approveSubscription,
    rejectSubscription,
} from "../controllers/subscriptionController";
import { protect, authorize } from "../middlewares/authMiddleware";

const router = Router();

// Vendor — নিজের subscription
router.get("/me", protect, authorize("vendor"), getMySubscription);
router.post("/request", protect, authorize("vendor"), requestSubscription);

// Super-admin — approve/reject
router.get("/requests", protect, authorize("super-admin"), listSubscriptionRequests);
router.post("/requests/:id/approve", protect, authorize("super-admin"), approveSubscription);
router.post("/requests/:id/reject", protect, authorize("super-admin"), rejectSubscription);

export default router;