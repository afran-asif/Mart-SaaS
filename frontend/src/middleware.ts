import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const hostname = request.headers.get("host") || "";
    const url = request.nextUrl;

    const parts = hostname.split(".");

    const isMainDomain =
        hostname === "localhost:3000" ||
        hostname === "mart-saas-1.onrender.com" ||  
        hostname === "vendoo.shop" ||          
        hostname === "www.vendoo.shop";

    if (isMainDomain) {
        return NextResponse.next();
    }

    // subdomain বের করা (localhost এর ক্ষেত্রে: sestone.localhost:3000 → parts[0] = "sestone")
    const subdomain = parts[0];

    if (subdomain) {
        url.pathname = `/store/${subdomain}${url.pathname}`;
        return NextResponse.rewrite(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};