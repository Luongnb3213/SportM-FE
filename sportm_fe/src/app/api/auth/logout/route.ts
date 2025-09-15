// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

function clearCookie(name: string) {
    return `${name}=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly`;
}

export async function POST() {
    const res = NextResponse.json({ status: "success", message: "Logged out" });

    // clear token (HttpOnly)
    res.headers.append("Set-Cookie", clearCookie("access_token"));
    // clear user
    res.headers.append("Set-Cookie", clearCookie("user"));

    return res;
}
