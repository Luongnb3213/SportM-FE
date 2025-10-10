import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.API_BASE ||
    process.env.API_URL ||
    "https://sportmbe.onrender.com";

function buildHeaders(token: string | undefined) {
    return {
        accept: "*/*",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

function resolveToken(raw?: string) {
    if (!raw) return undefined;
    try {
        return decodeURIComponent(raw);
    } catch {
        return raw;
    }
}

type Params = { id: string };

export async function PATCH(_: Request, ctx: { params: Promise<Params> }) {
    try {
        const { id } = await ctx.params;
        const token = resolveToken((await cookies()).get("access_token")?.value);

        const res = await fetch(`${API_BASE}/advertisement/${id}/home`, {
            method: "PATCH",
            headers: buildHeaders(token),
        });

        return await proxyResponse(res);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
