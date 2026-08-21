import express from "express";
import { paymentSuccess, paymentCancel, paymentFail, paymentIPN } from "../controllers/paymentController";

const router = express.Router();

router.post("/success", paymentSuccess);
router.post("/fail", paymentFail);
router.post("/cancel", paymentCancel);
router.post("/ipn", paymentIPN);

export default router;