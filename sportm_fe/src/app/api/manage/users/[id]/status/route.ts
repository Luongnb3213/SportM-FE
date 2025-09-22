import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BE = process.env.NEXT_PUBLIC_API_URL ?? "https://sportmbe.onrender.com";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const body = await req.json();
    const token = (await cookies()).get("access_token")?.value;

    const res = await fetch(`${BE}/users/${params.id}/status`, {
        method: "POST",
        headers: {
            accept: "*/*",
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
