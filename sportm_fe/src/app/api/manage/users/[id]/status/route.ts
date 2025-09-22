import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

const BE = process.env.NEXT_PUBLIC_API_URL ?? "https://sportmbe.onrender.com";

type Params = { id: string };

export async function POST(req: NextRequest, ctx: { params: Promise<Params> }) {
    // ⬅️ params là Promise → cần await
    const { id } = await ctx.params;

    // ⬅️ phiên bản của bạn: cookies() trả Promise
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    const body = await req.json();

    const res = await fetch(`${BE}/users/${id}/status`, {
        method: "POST",
        headers: {
            accept: "*/*",
            "Content-Type": "application/json",
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
