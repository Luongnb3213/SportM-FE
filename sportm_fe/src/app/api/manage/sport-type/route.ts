import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BE = process.env.NEXT_PUBLIC_API_URL ?? "https://sportmbe.onrender.com";

/** GET /api/manage/sport-type?page=&limit=&search= */
export async function GET(req: Request) {
    const url = new URL(req.url);
    const qs = url.search; // ?page=..&limit=..&search=..
    const token = (await cookies()).get("access_token")?.value;

    const res = await fetch(`${BE}/sport-type${qs}`, {
        method: "GET",
        headers: {
            accept: "*/*",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    const text = await res.text();
    try {
        return NextResponse.json(JSON.parse(text), { status: res.status });
    } catch {
        return new NextResponse(text, { status: res.status });
    }
}

/** POST /api/manage/sport-type  body: { typeName } */
export async function POST(req: Request) {
    const token = (await cookies()).get("access_token")?.value;
    const body = await req.json();

    const res = await fetch(`${BE}/sport-type`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
    });

    const text = await res.text();
    try {
        return NextResponse.json(JSON.parse(text), { status: res.status });
    } catch {
        return new NextResponse(text, { status: res.status });
    }
}
