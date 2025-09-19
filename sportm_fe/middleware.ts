// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();
    const raw = req.cookies.get("user")?.value;

    let role: "ADMIN" | "OWNER" | "CLIENT" | null = null;
    try {
        role = raw ? (JSON.parse(decodeURIComponent(raw)).role as "ADMIN" | "OWNER" | "CLIENT") : null;
    } catch { role = null; }

    // chưa đăng nhập -> về /login
    if (url.pathname.startsWith("/manage") && !role) {
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // CLIENT không có quyền vào khu manage
    if (url.pathname.startsWith("/manage") && role === "CLIENT") {
        url.pathname = "/";
        return NextResponse.redirect(url);
    }

    // ADMIN-only
    if (["/manage/users", "/manage/packages", "/manage/field-types"].some(p => url.pathname.startsWith(p))) {
        if (role !== "ADMIN") {
            url.pathname = "/manage";
            return NextResponse.redirect(url);
        }
    }


    // OWNER-only
    if (["/manage/fields", "/manage/reports"].some(p => url.pathname.startsWith(p))) {
        if (role !== "OWNER") {
            url.pathname = "/manage";
            return NextResponse.redirect(url);
        }
    }

    // /manage/ads: cả ADMIN và OWNER vào được
    return NextResponse.next();
}

export const config = {
    matcher: ["/manage/:path*"],
};
