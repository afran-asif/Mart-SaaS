import { Router } from "express";
import { sendToSteadfast, refreshCourierStatus, getCourierBalance } from "../controllers/courierController";
import { protect, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.use(protect, authorize("vendor"));

router.post("/steadfast/send/:orderId", sendToSteadfast);
router.get("/steadfast/status/:orderId", refreshCourierStatus);
router.get("/steadfast/balance", getCourierBalance);

export default router;
