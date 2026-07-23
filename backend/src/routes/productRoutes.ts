import { Router } from "express";
import { createProduct, deleteProduct, getVendorProducts, updateProduct } from "../controllers/productController";
import { protect, authorize } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/uploadMiddleware";

const router = Router();

// 🛒 ১. রুট রাউট ("/") - এখানে পোস্ট রিকোয়েস্টের সাথে ইমেজ আপলোডের মিডলওয়্যার যুক্ত করা হলো
router.route("/")
    .post(protect, authorize("vendor"), upload.array("images", 5), createProduct)
    .get(protect, authorize("vendor"), getVendorProducts);

// 🆔 ২. আইডি ভিত্তিক রাউট ("/:id") - প্রোডাক্ট আপডেট এবং ডিলিট করা
router.route("/:id")
    .put(protect, authorize("vendor"), updateProduct)
    .delete(protect, authorize("vendor"), deleteProduct);

export default router;