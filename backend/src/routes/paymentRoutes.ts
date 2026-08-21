import express from "express";
import {
    initiatePayment
} from "../controllers/paymentController";

const router = express.Router();

router.post("/initiate", initiatePayment);

export default router;