import { Router } from "express";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../controllers/categoryController";
import { protect, authorize } from "../middlewares/authMiddleware";
import { requireActivePlan } from "../middlewares/planGate";

const router = Router();

router.route("/")
    .get(protect, authorize("vendor", "super-admin"), requireActivePlan, getCategories)
    .post(protect, authorize("vendor", "super-admin"), requireActivePlan, createCategory);

router.route("/:id")
    .put(protect, authorize("vendor", "super-admin"), requireActivePlan, updateCategory)
    .delete(protect, authorize("vendor", "super-admin"), requireActivePlan, deleteCategory);

export default router;