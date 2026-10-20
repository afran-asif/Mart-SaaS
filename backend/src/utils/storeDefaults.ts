import { Types } from "mongoose";
import { Store } from "../models/Store";
import { Category } from "../models/Category";
import { Product } from "../models/Product";

export const DEFAULT_CATEGORIES = ["Clothing", "Gadgets", "Accessories", "Home & Kitchen", "Beauty & Health"];

const img = (id: string) => `https://images.unsplash.com/${id}?w=800&q=80`;

const HERO_IMAGE = img("photo-1441986300917-64674bd600d8");

interface DefaultProduct {
    name: string;
    price: number;
    description: string;
    category: string;
    images: string[];
    stock: number;
    featured?: boolean;
    sizes?: string[];
}

const DEFAULT_PRODUCTS: DefaultProduct[] = [
    {
        name: "Classic Cotton T-Shirt",
        price: 590,
        description: "Soft 100% cotton everyday t-shirt with a comfortable regular fit.",
        category: "Clothing",
        images: [img("photo-1521572163474-6864f9cf17ab")],
        stock: 40,
        featured: true,
        sizes: ["S", "M", "L", "XL"],
    },
    {
        name: "Slim Fit Denim Jeans",
        price: 1290,
        description: "Stretchable slim fit denim jeans with a clean five-pocket design.",
        category: "Clothing",
        images: [img("photo-1542272604-787c3835535d")],
        stock: 25,
        sizes: ["30", "32", "34", "36"],
    },
    {
        name: "Wireless Bluetooth Headphones",
        price: 2490,
        description: "Over-ear wireless headphones with deep bass and up to 20 hours of playback.",
        category: "Gadgets",
        images: [img("photo-1505740420928-5e560c06d30e")],
        stock: 18,
        featured: true,
    },
    {
        name: "Smart Fitness Watch",
        price: 3290,
        description: "Fitness watch with heart-rate tracking, step counter and notifications.",
        category: "Gadgets",
        images: [img("photo-1523275335684-37898b6baf30")],
        stock: 15,
    },
    {
        name: "Leather Crossbody Bag",
        price: 1590,
        description: "Compact crossbody bag with adjustable strap and premium stitching.",
        category: "Accessories",
        images: [img("photo-1553062407-98eeb64c6a62")],
        stock: 22,
        featured: true,
    },
    {
        name: "Polarized Sunglasses",
        price: 690,
        description: "UV400 polarized sunglasses with a lightweight durable frame.",
        category: "Accessories",
        images: [img("photo-1511499767150-a48a237f0083")],
        stock: 35,
    },
    {
        name: "Ceramic Coffee Mug Set",
        price: 850,
        description: "Set of two matte ceramic mugs, microwave and dishwasher safe.",
        category: "Home & Kitchen",
        images: [img("photo-1514228742587-6b1558fcca3d")],
        stock: 30,
    },
    {
        name: "Aroma Diffuser & Humidifier",
        price: 1190,
        description: "Whisper-quiet ultrasonic diffuser with warm ambient light.",
        category: "Home & Kitchen",
        images: [img("photo-1513694203232-719a280e022f")],
        stock: 20,
        featured: true,
    },
    {
        name: "Vitamin C Face Serum",
        price: 750,
        description: "Brightening vitamin C serum for daily skincare, suitable for all skin types.",
        category: "Beauty & Health",
        images: [img("photo-1556228720-195a672e8a03")],
        stock: 45,
    },
    {
        name: "Organic Skincare Gift Set",
        price: 1450,
        description: "Complete organic skincare set — cleanser, toner, serum and moisturiser.",
        category: "Beauty & Health",
        images: [img("photo-1571781926291-c477ebfd024b")],
        stock: 16,
    },
];

interface SeedParams {
    vendorId: Types.ObjectId;
    storeId: Types.ObjectId;
    storeName: string;
    email?: string;
    phone?: string;
}

export const seedNewStore = async ({
    vendorId,
    storeId,
    storeName,
    email,
    phone,
}: SeedParams): Promise<void> => {
    try {
        await Store.updateOne(
            { _id: storeId },
            {
                $set: {
                    theme: "classic",
                    brandColor: "#F4501A",
                    heroTitle: `Welcome to ${storeName}`,
                    heroSubtitle: "Handpicked products at the best prices — cash on delivery all over Bangladesh.",
                    heroImage: HERO_IMAGE,
                    contactEmail: email || null,
                    contactPhone: phone || null,
                    address: "Dhaka, Bangladesh",
                },
            }
        );

        await Category.insertMany(
            DEFAULT_CATEGORIES.map((name) => ({ vendorId, storeId, name }))
        );

        await Product.insertMany(
            DEFAULT_PRODUCTS.map((p) => ({ ...p, vendorId, storeId }))
        );
    } catch (error) {
        // Storefront decoration is a nice-to-have — registration must not fail because of it
        console.error("seedNewStore failed:", (error as Error).message);
    }
};
