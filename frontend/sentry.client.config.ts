import * as Sentry from "@sentry/nextjs";

// DSN না থাকলে SDK silent — dev-এ ভাঙবে না।
Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
    // Session replay বন্ধ (quota বাঁচাতে) — দরকার হলে পরে চালু করা যাবে
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
});
