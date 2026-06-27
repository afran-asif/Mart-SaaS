import { Router } from "express";
import { getTenantProducts } from "../controllers/productController";
import { tenantResolver } from "../middlewares/tenantMiddleware";

const router = Router();

router.get("/products", tenantResolver, getTenantProducts);

export default router;