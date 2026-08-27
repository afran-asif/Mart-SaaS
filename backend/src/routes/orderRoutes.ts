import express from "express";
import { protect } from "../middlewares/authMiddleware";
import {
    getVendorOrders,
    createOrder,
    updateOrderStatus,
} from "../controllers/orderController";
import { getVendorAnalytics } from "../controllers/orderController";
const router = express.Router();

router.get("/", protect, getVendorOrders);
router.post("/", createOrder);
router.patch("/:id/status", protect, updateOrderStatus);
router.get("/analytics", protect, getVendorAnalytics);
export default router;