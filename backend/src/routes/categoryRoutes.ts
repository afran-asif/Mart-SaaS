import { Router } from "express";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../controllers/categoryController";
import { protect, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.route("/")
    .get(protect, authorize("vendor", "super-admin"), getCategories)
    .post(protect, authorize("vendor", "super-admin"), createCategory);

router.route("/:id")
    .put(protect, authorize("vendor", "super-admin"), updateCategory)
    .delete(protect, authorize("vendor", "super-admin"), deleteCategory);

export default router;