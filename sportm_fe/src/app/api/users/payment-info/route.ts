import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_BASE =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.API_BASE ||
    process.env.API_URL ||
    "https://sportmbe.onrender.com";

function resolveToken(raw?: string) {
    if (!raw) return undefined;
    try {
        return decodeURIComponent(raw);
    } catch {
        return raw;
    }
}

function buildHeaders(token: string | undefined, extra?: HeadersInit) {
    return {
        accept: "*/*",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(extra ?? {}),
    };
}

async function toJsonResponse(res: Response) {
    const text = await res.text();
    try {
        return { body: JSON.parse(text) as unknown, text: undefined };
    } catch {
        return { body: undefined, text };
    }
}

export async function PATCH(req: NextRequest) {
    const token = resolveToken((await cookies()).get("access_token")?.value);
    const body = await req.text();

    const res = await fetch(`${API_BASE}/users/payment-info`, {
        method: "PATCH",
        headers: buildHeaders(token, { "Content-Type": "application/json" }),
        body,
        cache: "no-store",
    });

    const { body: jsonBody, text } = await toJsonResponse(res);

    if (jsonBody !== undefined) {
        return NextResponse.json(jsonBody, { status: res.status });
    }

    return new NextResponse(text ?? "", { status: res.status });
}
