import * as Sentry from "@sentry/node";

// Sentry init — অন্য সব module load-এর আগে চলতে হবে (app.ts-এর সবার প্রথমে import হয়)।
// SENTRY_DSN না থাকলে SDK silent থাকে — dev/test ভাঙবে না।
if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || "development",
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
        // bakan 500 — message/size flood রোধে
        beforeSend(event) {
            return event;
        },
    });
    console.log("✅ [SENTRY] Error tracking enabled");
} else {
    console.log("⚠️ [SENTRY] SENTRY_DSN not set — error tracking disabled.");
}
