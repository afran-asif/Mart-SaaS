import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_LOCALES = ["en", "bn"];
const DEFAULT_LOCALE = "en";

export function proxy(request: NextRequest) {
    const hostname = request.headers.get("host") || "";
    const url = request.nextUrl;
    const pathname = url.pathname;

    const parts = hostname.split(".");

    // দেওয়া main domain গুলো (configurable) — এখানেই subdomain নয়, platform root
    const MAIN_DOMAINS = [
        "localhost:3000",
        "mart-saa-s.vercel.app",
        "vendoo.shop",
        "www.vendoo.shop",
    ];

    // বেস domain এরো subdomain চেনা (যেমন af-brand.vendoo.shop, anything.localhost:3000)
    const BASEHOST_NAMES = ["vendoo.shop", "mart-saa-s.vercel.app", "localhost:3000"];

    const isMainDomain = MAIN_DOMAINS.includes(hostname);

    // hostname থেকে port বাদ (custom domain identifier-এ port থাকবে না)
    const hostWithoutPort = hostname.split(":")[0];

    if (!isMainDomain) {
        const isSubOfBase = BASEHOST_NAMES.some((b) => hostname.endsWith(`.${b}`));

        if (isSubOfBase) {
            // 1. Platform subdomain (ex: sestone.vendoo.shop / af-brand.localhost:3000)
            const subdomain = parts[0];
            if (subdomain && subdomain !== "www") {
                url.pathname = `/store/${subdomain}${pathname}`;
                return NextResponse.rewrite(url);
            }
        } else {
            // 2. Custom domain (ex: shop.afrangadget.com) — পুরো hostname-ই tenant identifier
            // www. prefix থাকলে বাদ (www.shop.x.com → shop.x.com)
            const identifier = hostWithoutPort.replace(/^www\./, "");
            url.pathname = `/store/${identifier}${pathname}`;
            return NextResponse.rewrite(url);
        }
    }

    // 2. Main domain SEO locale routing (/en, /bn)
    // Ignore internal store paths or static files
    if (pathname.startsWith("/store")) {
        return NextResponse.next();
    }

    // Ignore SEO metadata files (served at root, not locale-prefixed)
    if (pathname === "/sitemap.xml" || pathname === "/robots.txt") {
        return NextResponse.next();
    }

    // Check if pathname already starts with a supported locale (/en or /bn)
    const pathnameHasLocale = SUPPORTED_LOCALES.some(
        (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
    );

    if (pathnameHasLocale) {
        return NextResponse.next();
    }

    // Check if user previously selected a language via cookie
    const savedLocale = request.cookies.get("NEXT_LOCALE")?.value || DEFAULT_LOCALE;
    const locale = SUPPORTED_LOCALES.includes(savedLocale) ? savedLocale : DEFAULT_LOCALE;

    // Redirect to localized URL (e.g., / -> /en, /login -> /en/login, /dashboard -> /en/dashboard)
    const targetPath = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
    url.pathname = targetPath;
    return NextResponse.redirect(url);
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    ],
};
