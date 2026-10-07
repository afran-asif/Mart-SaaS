import { Router } from "express";
import { sendToSteadfast, refreshCourierStatus, getCourierBalance } from "../controllers/courierController";
import { protect, authorize } from "../middlewares/authMiddleware";
import { requireActivePlan } from "../middlewares/planGate";

const router = Router();

router.use(protect, authorize("vendor"), requireActivePlan);

router.post("/steadfast/send/:orderId", sendToSteadfast);
router.get("/steadfast/status/:orderId", refreshCourierStatus);
router.get("/steadfast/balance", getCourierBalance);

export default router;
