import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BE =
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_API_BASE ??
    process.env.API_BASE ??
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

async function proxyResponse(res: Response) {
    const text = await res.text();
    try {
        return NextResponse.json(JSON.parse(text), { status: res.status });
    } catch {
        return new NextResponse(text, { status: res.status });
    }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await ctx.params;
        const token = resolveToken((await cookies()).get("access_token")?.value);
        const body = await req.text();

        const res = await fetch(`${BE}/subcription/${id}`, {
            method: "PATCH",
            headers: buildHeaders(token, { "Content-Type": "application/json" }),
            body,
        });

        return await proxyResponse(res);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
