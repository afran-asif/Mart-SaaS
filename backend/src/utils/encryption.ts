import crypto from "crypto";

// AES-256-CBC ব্যবহার করছি — এটা শক্তিশালী আর widely-used এনক্রিপশন
const ALGORITHM = "aes-256-cbc";

// .env এ ENCRYPTION_KEY নামে একটা 32-byte (64 hex character) key রাখতে হবে
// এই key যেন কখনো git এ commit না হয় (JWT_SECRET এর মতোই sensitive)
const getKey = (): Buffer => {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length !== 64) {
        throw new Error(
            "ENCRYPTION_KEY must be set in .env as a 64-character hex string (32 bytes)"
        );
    }
    return Buffer.from(key, "hex");
};

/**
 * যেকোনো string কে encrypt করে "iv:encryptedData" ফরম্যাটে ফেরত দেয়।
 * IV (Initialization Vector) প্রতিবার random হয়, তাই একই password দুইবার
 * encrypt করলেও আলাদা output আসবে — এটা security best practice।
 */
export const encrypt = (text: string): string => {
    const iv = crypto.randomBytes(16); // random 16-byte IV
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
};

/**
 * encrypt() দিয়ে বানানো string কে ফেরত decrypt করে আসল ভ্যালুতে নিয়ে আসে।
 */
export const decrypt = (encryptedText: string): string => {
    const [ivHex, encrypted] = encryptedText.split(":");
    if (!ivHex || !encrypted) {
        throw new Error("Invalid encrypted text format");
    }
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
};