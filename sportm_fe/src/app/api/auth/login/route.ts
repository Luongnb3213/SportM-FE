import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://sportmbe.onrender.com";
const BE_URL = `${API_BASE}/auth/signin`;
const isProd = process.env.NODE_ENV === "production";

// ==== helpers ====
function cookieString({
    name,
    value,
    maxAge,
    httpOnly = true,
    path = "/",
    sameSite = "lax",
}: {
    name: string;
    value: string;
    maxAge?: number;
    httpOnly?: boolean;
    path?: string;
    sameSite?: "lax" | "strict" | "none";
}) {
    const parts = [
        `${name}=${value}`,
        `Path=${path}`,
        `SameSite=${sameSite}`,
        httpOnly ? "HttpOnly" : "",
        typeof maxAge === "number" ? `Max-Age=${maxAge}` : "",
    ];
    if (isProd) parts.push("Secure"); // chỉ set Secure khi chạy https (prod)
    return parts.filter(Boolean).join("; ");
}

// Kiểu dữ liệu BE trả về khi ok
type BackendOk = {
    data: {
        message: string;
        access: string;
        user: Record<string, unknown>;
    };
};
function isBackendOk(x: unknown): x is BackendOk {
    if (!x || typeof x !== "object") return false;
    const obj = x as Record<string, unknown>;
    const data = obj.data as Record<string, unknown> | undefined;
    return !!data && typeof data.message === "string" && typeof data.access === "string" && !!data.user && typeof data.user === "object";
}
function extractMessage(x: unknown): string | undefined {
    if (typeof x === "string") return x;
    if (x && typeof x === "object") {
        const obj = x as Record<string, unknown>;
        if (typeof obj.message === "string") return obj.message;
        if (typeof obj.error === "string") return obj.error;
    }
    return undefined;
}

// ==== handler ====
export async function POST(req: Request) {
    try {
        const { email, password, remember } = await req.json();

        const res = await fetch(BE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", accept: "*/*" },
            body: JSON.stringify({ email, password }),
            cache: "no-store",
        });

        const text = await res.text();
        let json: unknown;
        try { json = JSON.parse(text); } catch { json = { message: text }; }

        if (!res.ok) {
            const msg = extractMessage(json) ?? "Login failed";
            return NextResponse.json({ error: msg }, { status: res.status || 400 });
        }

        if (!isBackendOk(json)) {
            return NextResponse.json({ error: "Malformed response from server" }, { status: 502 });
        }

        const data = json.data;
        const maxAge = (remember ? 7 : 1) * 24 * 60 * 60;

        const response = NextResponse.json({ data, status: "success" }, { status: 200 });

        response.headers.append("Set-Cookie", cookieString({
            name: "access_token",
            value: encodeURIComponent(data.access),
            maxAge,
            httpOnly: true,
            sameSite: "lax",
        }));

        response.headers.append("Set-Cookie", cookieString({
            name: "user",
            value: encodeURIComponent(JSON.stringify(data.user)),
            maxAge,
            httpOnly: false,
            sameSite: "lax",
        }));

        return response;
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unexpected error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
