import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

function buildHeaders(token: string | undefined) {
    return {
        accept: "*/*",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function proxyJson(res: Response) {
    const text = await res.text();
    try {
        return NextResponse.json(JSON.parse(text), { status: res.status });
    } catch {
        return new NextResponse(text, { status: res.status });
    }
}

export async function GET() {
    try {
        const token = resolveToken((await cookies()).get("access_token")?.value);

        const res = await fetch(`${API_BASE}/owner/dashboard`, {
            method: "GET",
            headers: buildHeaders(token),
        });

        return await proxyJson(res);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unexpected error";
        return NextResponse.json({ status: "error", statusCode: 500, message }, { status: 500 });
    }
}

