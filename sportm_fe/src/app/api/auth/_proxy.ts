// app/api/auth/_proxy.ts
import { NextResponse } from "next/server";

const BE = process.env.BE_ORIGIN ?? "https://sportmbe.onrender.com";

export async function proxyAuth(path: string, req: Request) {
    const body = req.method === "GET" ? undefined : await req.text(); // giữ nguyên body
    const res = await fetch(`${BE}${path}`, {
        method: req.method,
        headers: { "Content-Type": "application/json" },
        body,
        // credentials: "include", // mở nếu BE dùng cookie
    });

    const text = await res.text();
    let data: unknown;
    try {
        data = JSON.parse(text) as unknown;
    } catch {
        data = text as string;
    }

    return NextResponse.json(data, { status: res.status });
}
