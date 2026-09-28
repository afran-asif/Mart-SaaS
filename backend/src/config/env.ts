// Startup env validation — missing key নিয়ে অর্ধেক-চালু server রোধে fail-fast।
// Required absent → process exit(1). Optional absent → warning মাত্র।

const REQUIRED = ["MONGODB_URI", "JWT_SECRET"] as const;

const OPTIONAL = [
    "ENCRYPTION_KEY",
    "RESEND_API_KEY",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "FRONTEND_URL",
    "FRONTEND_BASE_DOMAIN",
    "BACKEND_URL",
    "SUBSCRIPTION_BKASH_NUMBER",
    "VERCEL_TOKEN",
    "VERCEL_PROJECT_ID",
] as const;

export const validateEnv = (): void => {
    const missing = REQUIRED.filter((k) => !process.env[k]);
    if (missing.length > 0) {
        console.error(`❌ [ENV] Missing required variables: ${missing.join(", ")}`);
        process.exit(1);
    }

    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 16) {
        console.error("❌ [ENV] JWT_SECRET is too short (min 16 chars).");
        process.exit(1);
    }

    const unset = OPTIONAL.filter((k) => !process.env[k]);
    if (unset.length > 0) {
        console.warn(`⚠️ [ENV] Optional variables not set (related features disabled): ${unset.join(", ")}`);
    }
};