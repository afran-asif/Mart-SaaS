import { Router } from "express";
import { getTenantProducts, getTenantProductById } from "../controllers/productController";
import { getTenantStoreInfo } from "../controllers/storeController";
import { tenantResolver } from "../middlewares/tenantMiddleware";

const router = Router();

router.get("/store", tenantResolver, getTenantStoreInfo);
router.get("/products", tenantResolver, getTenantProducts);
router.get("/products/:id", tenantResolver, getTenantProductById);

export default router;