import express from "express";
import { protect } from "../middlewares/authMiddleware";
import {
    getVendorOrders,
    createOrder,
    updateOrderStatus,
    getVendorCustomers,
    trackOrder,
} from "../controllers/orderController";
import { getVendorAnalytics } from "../controllers/orderController";
const router = express.Router();

router.get("/", protect, getVendorOrders);
router.post("/", createOrder);
router.patch("/:id/status", protect, updateOrderStatus);
router.get("/customers", protect, getVendorCustomers);
router.get("/analytics", protect, getVendorAnalytics);
// Public tracking (no auth — orderId + phone verify)
router.get("/track/:orderId", trackOrder);
export default router;