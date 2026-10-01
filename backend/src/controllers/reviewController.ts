import { Response } from "express";
import { Review } from "../models/Review";
import { Product } from "../models/Product";
import { Store } from "../models/Store";
import Order from "../models/Order";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { TenantRequest } from "../middlewares/tenantMiddleware";

const normPhone = (p?: string) => (p || "").replace(/\D/g, "").slice(-11);

const avgOf = (reviews: { rating: number }[]) =>
    reviews.length ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : 0;

// 🌐 Public — review লেখা (tenant-resolved store-এ)
export const createTenantReview = async (req: TenantRequest, res: Response): Promise<void> => {
    try {
        const storeId = req.storeId;
        const store = req.store;
        if (!storeId || !store) {
            res.status(400).json({ message: "Store not found." });
            return;
        }
        const { productId, customerName, phone, rating, comment, orderId } = req.body as {
            productId?: string;
            customerName?: string;
            phone?: string;
            rating?: number;
            comment?: string;
            orderId?: string;
        };

        const stars = Number(rating);
        if (!productId || !customerName?.trim() || !phone?.trim() || !stars || stars < 1 || stars > 5) {
            res.status(400).json({ message: "Name, phone and rating (1-5) are required." });
            return;
        }
        if (comment && comment.length > 1000) {
            res.status(400).json({ message: "Review is too long (max 1000 characters)." });
            return;
        }

        const product = await Product.findOne({ _id: productId, storeId }).select("_id");
        if (!product) {
            res.status(404).json({ message: "Product not found in this store." });
            return;
        }

        // verified buyer? — orderId মিললে + phone মিললে + product ওই order-এ থাকলে
        let verifiedBuyer = false;
        if (orderId) {
            try {
                const order = await Order.findOne({ _id: orderId, storeId }).select("phone items status");
                if (
                    order &&
                    order.status !== "Cancelled" &&
                    normPhone(order.phone) === normPhone(phone) &&
                    (order.items || []).some((it: any) => it.product?.toString() === productId)
                ) {
                    verifiedBuyer = true;
                }
            } catch { /* invalid orderId — unverified থাকে */ }
        }

        try {
            const review = await Review.create({
                vendorId: store.vendorId,
                storeId,
                productId,
                customerName: customerName.trim(),
                phone: phone.trim(),
                rating: stars,
                comment: (comment || "").trim() || undefined,
                verifiedBuyer,
            });
            res.status(201).json({ success: true, review: { id: review._id, verifiedBuyer } });
        } catch (error: any) {
            if (error?.code === 11000) {
                res.status(400).json({ message: "You have already reviewed this product." });
                return;
            }
            throw error;
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Failed to submit review" });
    }
};

// 🌐 Public — product-এর visible reviews + average
export const getTenantReviews = async (req: TenantRequest, res: Response): Promise<void> => {
    try {
        const storeId = req.storeId;
        const productId = ((req.query.productId as string) || "").trim();
        if (!storeId || !productId) {
            res.status(400).json({ message: "productId is required." });
            return;
        }
        const reviews = await Review.find({ storeId, productId, visible: true })
            .sort({ createdAt: -1 })
            .limit(50)
            .select("customerName rating comment verifiedBuyer createdAt")
            .lean();
        res.status(200).json({
            success: true,
            count: reviews.length,
            average: avgOf(reviews),
            reviews,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Failed to load reviews" });
    }
};

const getVendorStore = async (vendorId: string) => Store.findOne({ vendorId });

// 🏪 Vendor — নিজের সব reviews
export const getVendorReviews = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const store = await getVendorStore(req.user._id.toString());
        if (!store) {
            res.status(404).json({ message: "Store not found." });
            return;
        }
        const reviews = await Review.find({ storeId: store._id })
            .populate("productId", "name images")
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();
        res.status(200).json({ success: true, reviews });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// 🏪 Vendor — hide/show
export const toggleReviewVisibility = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const store = await getVendorStore(req.user._id.toString());
        if (!store) {
            res.status(404).json({ message: "Store not found." });
            return;
        }
        const review = await Review.findOne({ _id: req.params.id, storeId: store._id });
        if (!review) {
            res.status(404).json({ message: "Review not found." });
            return;
        }
        review.visible = !review.visible;
        await review.save();
        res.status(200).json({ success: true, visible: review.visible });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// 🏪 Vendor — delete
export const deleteReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const store = await getVendorStore(req.user._id.toString());
        if (!store) {
            res.status(404).json({ message: "Store not found." });
            return;
        }
        const review = await Review.findOneAndDelete({ _id: req.params.id, storeId: store._id });
        if (!review) {
            res.status(404).json({ message: "Review not found." });
            return;
        }
        res.status(200).json({ success: true, message: "Review deleted." });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
