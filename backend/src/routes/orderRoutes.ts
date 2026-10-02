import express from "express";
import { protect } from "../middlewares/authMiddleware";
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

router.get("/", protect, getVendorOrders);
router.post("/", createOrder);
router.patch("/:id/status", protect, updateOrderStatus);
router.get("/customers", protect, getVendorCustomers);
router.get("/analytics", protect, getVendorAnalytics);
router.get("/pending-count", protect, getPendingCount);
router.get("/notifications", protect, getNotifications);
router.patch("/seen-all", protect, markAllSeen);
router.patch("/:id/seen", protect, markOrderSeen);
// Public tracking (no auth — orderId + phone verify)
router.get("/track/:orderId", trackOrder);
export default router;