import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

const BE = process.env.NEXT_PUBLIC_API_URL ?? "https://sportmbe.onrender.com";

type Params = { id: string };

/** PATCH /api/manage/sport-type/:id  body: { typeName } */
export async function PATCH(req: NextRequest, ctx: { params: Promise<Params> }) {
    // params là Promise -> cần await
    const { id } = await ctx.params;

    // cookies() là async trong phiên bản của bạn
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    const body = await req.json();

    const res = await fetch(`${BE}/sport-type/${id}`, {
        method: "PATCH",
        headers: {
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

/** DELETE /api/manage/sport-type/:id */
export async function DELETE(_req: NextRequest, ctx: { params: Promise<Params> }) {
    // params là Promise -> cần await
    const { id } = await ctx.params;

    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    const res = await fetch(`${BE}/sport-type/${id}`, {
        method: "DELETE",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
    });

    const text = await res.text();
    try {
        return NextResponse.json(JSON.parse(text), { status: res.status });
    } catch {
        return new NextResponse(text, { status: res.status });
    }
}
