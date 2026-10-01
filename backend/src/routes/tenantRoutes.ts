import { Router } from "express";
import { getTenantProducts, getTenantProductById } from "../controllers/productController";
import { getTenantStoreInfo } from "../controllers/storeController";
import { getTenantCategories } from "../controllers/categoryController";
import { getTenantReviews, createTenantReview } from "../controllers/reviewController";
import { tenantResolver } from "../middlewares/tenantMiddleware";

const router = Router();

router.get("/store", tenantResolver, getTenantStoreInfo);
router.get("/products", tenantResolver, getTenantProducts);
router.get("/products/:id", tenantResolver, getTenantProductById);
router.get("/categories", tenantResolver, getTenantCategories);
router.get("/reviews", tenantResolver, getTenantReviews);
router.post("/reviews", tenantResolver, createTenantReview);

export default router;