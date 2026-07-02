import multer from "multer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// ☁️ Cloudinary কনফিগারেশন
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 'uploads' ফোল্ডার না থাকলে তা অটোমেটিক তৈরি করার লজিক
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ফাইল কোথায় এবং কী নামে সেভ হবে তা নির্ধারণ
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // ইউনিক নাম তৈরি করার জন্য টাইমস্ট্যাম্প যোগ করা হলো
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

// ফাইল ভ্যালিডেশন (শুধু ইমেজ সাপোর্ট করবে)
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only images are allowed!"), false);
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // সর্বোচ্চ ৫ মেগাবাইট
});
// 🚀 Cloudinary-তে ফাইল আপলোড করার হেল্পার ফাংশন
export const uploadToCloudinary = async (localFilePath: string): Promise<string> => {
    try {
        const result = await cloudinary.uploader.upload(localFilePath, {
            folder: "mart-saas-products", // ক্লাউডিনারিতে এই ফোল্ডারে ইমেজ সেভ হবে
        });

        // 🧹 ক্লাউডিনারিতে আপলোড সফল হলে লোকাল সার্ভারের ফাইলটি ডিলিট করে দেওয়া হচ্ছে
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return result.secure_url; // ক্লাউডিনারি ইমেজের সিকিউরড URL রিটার্ন করবে
    } catch (error) {
        // আপলোড ফেইল করলেও লোকাল ফাইলটি রিমুভ করা হচ্ছে যাতে আবর্জনা জমা না হয়
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        throw new Error("Cloudinary upload failed: " + (error as Error).message);
    }
};