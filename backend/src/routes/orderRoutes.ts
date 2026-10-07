import express from "express";
import { protect } from "../middlewares/authMiddleware";
import { requireActivePlan } from "../middlewares/planGate";
import {
    getVendorOrders,
    createOrder,
    updateOrderStatus,
    getVendorCustomers,
    trackOrder,
    getPendingCount,
    getNotifications,
    markOrderSeen,
    markAllSeen,
} from "../controllers/orderController";
import { getVendorAnalytics } from "../controllers/orderController";
const router = express.Router();

router.get("/", protect, requireActivePlan, getVendorOrders);
router.post("/", createOrder);
router.patch("/:id/status", protect, requireActivePlan, updateOrderStatus);
router.get("/customers", protect, requireActivePlan, getVendorCustomers);
router.get("/analytics", protect, requireActivePlan, getVendorAnalytics);
router.get("/pending-count", protect, requireActivePlan, getPendingCount);
router.get("/notifications", protect, requireActivePlan, getNotifications);
router.patch("/seen-all", protect, requireActivePlan, markAllSeen);
router.patch("/:id/seen", protect, requireActivePlan, markOrderSeen);
// Public tracking (no auth — orderId + phone verify)
router.get("/track/:orderId", trackOrder);
export default router;