import express from "express";
import {
    initiatePayment,
    paymentSuccess,
    paymentFail,
    paymentCancel,
    paymentIPN,
} from "../controllers/paymentController";

const router = express.Router();

router.post("/initiate", initiatePayment);
router.post("/success", paymentSuccess);
router.post("/fail", paymentFail);
router.post("/cancel", paymentCancel);
router.post("/ipn", paymentIPN);

export default router;