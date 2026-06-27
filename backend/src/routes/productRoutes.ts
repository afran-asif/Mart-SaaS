import { Router } from "express";
import { createProduct, deleteProduct, getVendorProducts, updateProduct } from "../controllers/productController";
import { protect, authorize } from "../middlewares/authMiddleware";
const router = Router();

router.route("/")
    .post(protect, authorize("vendor"), createProduct)
    .get(protect, authorize("vendor"), getVendorProducts);

router.route("/:id")
    .put(protect, authorize("vendor"), updateProduct)
    .delete(protect, authorize("vendor"), deleteProduct);
export default router;