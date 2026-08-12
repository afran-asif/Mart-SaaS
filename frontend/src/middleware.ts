import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const hostname = request.headers.get("host") || "";
    const url = request.nextUrl;

    // hostname থেকে subdomain বের করা
    const parts = hostname.split(".");

    // main domain চেক (কোনো subdomain নেই এমন কেস)
    const isMainDomain =
        hostname === "localhost:3000" ||
        hostname === "yourdomain.com" ||
        hostname === "www.yourdomain.com";

    if (isMainDomain) {
        // Vendor dashboard / main app — কোনো rewrite দরকার নেই
        return NextResponse.next();
    }

    // subdomain বের করা (localhost এর ক্ষেত্রে: sestone.localhost:3000 → parts[0] = "sestone")
    const subdomain = parts[0];

    if (subdomain) {
        // /store/[subdomain] এর দিকে internally rewrite করা
        // url.pathname যা ছিল (যেমন "/" বা "/product/123") সেটা যোগ হবে subdomain path এর পরে
        url.pathname = `/store/${subdomain}${url.pathname}`;
        return NextResponse.rewrite(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * নিচের path গুলো বাদ দিয়ে সব route এ middleware চলবে:
         * - api routes
         * - Next.js static/image files
         * - favicon
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};