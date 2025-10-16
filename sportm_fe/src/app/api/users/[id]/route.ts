import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_BASE =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.API_BASE ||
    process.env.API_URL ||
    "https://sportmbe.onrender.com";

type Params = { id: string };

function resolveToken(raw?: string) {
    if (!raw) return undefined;
    try {
        return decodeURIComponent(raw);
    } catch {
        return raw;
    }
}

async function toJsonResponse(res: Response) {
    const text = await res.text();
    try {
        return { body: JSON.parse(text) as unknown, text: undefined };
    } catch {
        return { body: undefined, text };
    }
}

function buildAuthHeaders(token: string | undefined, extra?: HeadersInit) {
    return {
        accept: "*/*",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(extra ?? {}),
    };
}

function enhanceUserCookie(existing: string | undefined, nextData: Record<string, unknown>) {
    if (!nextData) return undefined;
    const nextUser = {
        ...(existing
            ? (() => {
                try {
                    return JSON.parse(decodeURIComponent(existing)) as Record<string, unknown>;
                } catch {
                    return {};
                }
            })()
            : {}),
        ...nextData,
    };

    return encodeURIComponent(JSON.stringify(nextUser));
}

export async function GET(req: NextRequest, ctx: { params: Promise<Params> }) {
    const { id } = await ctx.params;
    const token = resolveToken((await cookies()).get("access_token")?.value);

    const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "GET",
        headers: buildAuthHeaders(token),
        cache: "no-store",
    });

    const { body, text } = await toJsonResponse(res);
    if (body !== undefined) {
        return NextResponse.json(body, { status: res.status });
    }
    return new NextResponse(text ?? "", { status: res.status });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<Params> }) {
    const { id } = await ctx.params;
    const cookieStore = await cookies();
    const token = resolveToken(cookieStore.get("access_token")?.value);
    const body = await req.text();

    const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "PATCH",
        headers: buildAuthHeaders(token, { "Content-Type": "application/json" }),
        body,
        cache: "no-store",
    });

    const { body: jsonBody, text } = await toJsonResponse(res);
    if (jsonBody !== undefined) {
        const response = NextResponse.json(jsonBody, { status: res.status });

        if (res.ok && jsonBody && typeof jsonBody === "object" && "data" in jsonBody) {
            const data = (jsonBody as { data?: Record<string, unknown> }).data;
            if (data && typeof data === "object") {
                const currentUser = cookieStore.get("user")?.value;
                const cookiePayload = enhanceUserCookie(currentUser, {
                    id: data.userId ?? data.id,
                    userId: data.userId ?? data.id,
                    email: data.email,
                    fullName: data.fullName,
                    phone: data.phoneNumber ?? data.phone,
                    phoneNumber: data.phoneNumber ?? data.phone,
                    role: data.role,
                });
                if (cookiePayload) {
                    const cookieParts = [
                        `user=${cookiePayload}`,
                        "Path=/",
                        "SameSite=Lax",
                        "Max-Age=604800",
                    ];
                    if (process.env.NODE_ENV === "production") {
                        cookieParts.push("Secure");
                    }
                    response.headers.append(
                        "Set-Cookie",
                        cookieParts.join("; ")
                    );
                }
            }
        }

        return response;
    }

    return new NextResponse(text ?? "", { status: res.status });
}
