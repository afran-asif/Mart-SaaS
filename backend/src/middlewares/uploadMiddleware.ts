// src/middlewares/uploadMiddleware.ts
import multer from "multer";
import path from "path";
import fs from "fs";

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