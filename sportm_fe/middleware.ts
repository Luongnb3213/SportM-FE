// middleware.ts
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type Role = "ADMIN" | "OWNER" | "CLIENT" | null;

const ADMIN_ONLY_PATTERNS = [
    /^\/manage\/users(?:\/|$)/,
    /^\/manage\/packages(?:\/|$)/,
    /^\/manage\/sport-type(?:\/|$)/,
];

const OWNER_ONLY_PATTERNS = [
    /^\/manage\/fields(?:\/|$)/,
    /^\/manage\/reports(?:\/|$)/,
];

function parseRole(raw: string | undefined | null): Role {
    if (!raw) return null;
    try {
        const decoded = decodeURIComponent(raw);
        const obj = JSON.parse(decoded) as { role?: unknown };
        const role = obj?.role;
        if (role === "ADMIN" || role === "OWNER" || role === "CLIENT") return role;
        return null;
    } catch {
        return null;
    }
}

export function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();
    const pathname = url.pathname;
    const role = parseRole(req.cookies.get("user")?.value);

    if (!pathname.startsWith("/manage")) {
        return NextResponse.next();
    }

    if (!role) {
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    if (role === "CLIENT") {
        url.pathname = "/";
        return NextResponse.redirect(url);
    }

    if (ADMIN_ONLY_PATTERNS.some((pattern) => pattern.test(pathname))) {
        if (role !== "ADMIN") {
            url.pathname = "/manage";
            return NextResponse.redirect(url);
        }
    }

    if (OWNER_ONLY_PATTERNS.some((pattern) => pattern.test(pathname))) {
        if (role !== "OWNER") {
            url.pathname = "/manage";
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/manage/:path*"],
};
