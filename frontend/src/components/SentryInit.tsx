"use client";

// Browser-side Sentry init — client bundle-এ একবার চলে (root Providers-এর ভেতরে mount হয়)।
import "../../sentry.client.config";

export default function SentryInit() {
    return null;
}
