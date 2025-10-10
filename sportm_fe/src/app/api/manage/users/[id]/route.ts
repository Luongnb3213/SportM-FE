import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BE = process.env.NEXT_PUBLIC_API_URL ?? "https://sportmbe.onrender.com";

type Params = { id: string };

export async function PATCH(req: NextRequest, ctx: { params: Promise<Params> }) {
    const { id } = await ctx.params;
    const token = (await cookies()).get("access_token")?.value;
    const body = await req.json();

    const res = await fetch(`${BE}/admin/users/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
        cache: "no-store",
    });

    const text = await res.text();
    try {
        return NextResponse.json(JSON.parse(text), { status: res.status });
    } catch {
        return new NextResponse(text, { status: res.status });
    }
}
