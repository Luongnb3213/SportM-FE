import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BE = process.env.NEXT_PUBLIC_API_URL ?? "https://sportmbe.onrender.com";

/** PATCH /api/manage/sport-type/:id  body: { typeName } */
export async function PATCH(req: Request, context: { params: { id: string } }) {
    const { id } = context.params;
    const token = cookies().get("access_token")?.value; // sync
    const body = await req.json();

    const res = await fetch(`${BE}/sport-type/${id}`, {
        method: "PATCH",
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

/** DELETE /api/manage/sport-type/:id */
export async function DELETE(_req: Request, context: { params: { id: string } }) {
    const { id } = context.params;
    const token = cookies().get("access_token")?.value; // sync

    const res = await fetch(`${BE}/sport-type/${id}`, {
        method: "DELETE",
        headers: {
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
