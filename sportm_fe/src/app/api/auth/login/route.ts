import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://sportmbe.onrender.com";
const BE_URL = `${API_BASE}/auth/signin`;
const isProd = process.env.NODE_ENV === "production";

// ==== helpers ====
function base64UrlDecode(input: string): string {
    const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
    const pad = normalized.length % 4;
    const padded = pad ? normalized + "=".repeat(4 - pad) : normalized;
    return Buffer.from(padded, "base64").toString("utf8");
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    try {
        const payload = base64UrlDecode(parts[1]);
        const json = JSON.parse(payload) as Record<string, unknown>;
        return json;
    } catch {
        return null;
    }
}

function extractId(claims: Record<string, unknown>): string | undefined {
    const keys = ["userId", "id", "sub"];
    for (const key of keys) {
        const value = claims[key];
        if (typeof value === "string" && value) return value;
    }
    return undefined;
}

function extractUserFromJwt(token: string | undefined) {
    if (!token) return null;
    const claims = decodeJwtPayload(token);
    if (!claims) return null;

    const id = extractId(claims);
    const email = typeof claims.email === "string" ? claims.email : undefined;
    const fullName =
        typeof claims.fullName === "string"
            ? claims.fullName
            : typeof claims.name === "string"
                ? claims.name
                : undefined;
    const role =
        typeof claims.role === "string"
            ? claims.role
            : undefined;
    const avatarUrl =
        typeof claims.avatarUrl === "string"
            ? claims.avatarUrl
            : typeof claims.imgUrl === "string"
                ? claims.imgUrl
                : undefined;
    const phoneNumber =
        typeof claims.phoneNumber === "string"
            ? claims.phoneNumber
            : typeof claims.phone === "string"
                ? claims.phone
                : undefined;

    return {
        id,
        userId: id,
        email,
        fullName,
        role,
        avatarUrl,
        phoneNumber,
    };
}

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
    if (typeof x === "string" && x.trim()) return x;
    if (x && typeof x === "object") {
        const obj = x as Record<string, unknown>;
        if (typeof obj.message === "string" && obj.message.trim()) return obj.message;
        if (typeof obj.error === "string" && obj.error.trim()) return obj.error;
        const data = obj.data;
        if (typeof data === "string" && data.trim()) return data;
        if (Array.isArray(data)) {
            const first = data.find((item) => typeof item === "string" && item.trim());
            if (typeof first === "string") return first;
        }
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
            const msg = extractMessage(json) ?? "Đăng nhập thất bại";
            const payload =
                json && typeof json === "object"
                    ? { ...(json as Record<string, unknown>), error: msg, message: msg }
                    : { error: msg, message: msg, status: "error" };
            return NextResponse.json(payload, { status: res.status || 400 });
        }

        if (!isBackendOk(json)) {
            return NextResponse.json({ error: "Malformed response from server" }, { status: 502 });
        }

        const data = json.data;
        const maxAge = (remember ? 7 : 1) * 24 * 60 * 60;

        const jwtUser = extractUserFromJwt(data.access);
        const backendUser = (data.user ?? {}) as Record<string, unknown>;
        const cookieUser = {
            ...backendUser,
        };

        const idFromBackend =
            (typeof backendUser.userId === "string" && backendUser.userId) ||
            (typeof backendUser.id === "string" && backendUser.id);
        const idFromJwt = jwtUser?.userId;

        if (!("userId" in cookieUser) || typeof cookieUser.userId !== "string" || !cookieUser.userId) {
            if (idFromBackend) cookieUser.userId = idFromBackend;
            else if (idFromJwt) cookieUser.userId = idFromJwt;
        }
        if (!("id" in cookieUser) || typeof cookieUser.id !== "string" || !cookieUser.id) {
            if (idFromBackend) cookieUser.id = idFromBackend;
            else if (idFromJwt) cookieUser.id = idFromJwt;
        }
        if (!cookieUser.email && jwtUser?.email) cookieUser.email = jwtUser.email;
        if (!cookieUser.fullName && jwtUser?.fullName) cookieUser.fullName = jwtUser.fullName;
        if (!cookieUser.role && jwtUser?.role) cookieUser.role = jwtUser.role;
        if (!cookieUser.avatarUrl && jwtUser?.avatarUrl) cookieUser.avatarUrl = jwtUser.avatarUrl;
        if (!cookieUser.phoneNumber && jwtUser?.phoneNumber) cookieUser.phoneNumber = jwtUser.phoneNumber;
        if (!cookieUser.phone && jwtUser?.phoneNumber) cookieUser.phone = jwtUser.phoneNumber;

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
            value: encodeURIComponent(JSON.stringify(cookieUser)),
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
