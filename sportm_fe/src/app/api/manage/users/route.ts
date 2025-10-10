import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BE = process.env.NEXT_PUBLIC_API_URL ?? "https://sportmbe.onrender.com";

export async function GET(req: Request) {
    // Lấy query từ URL hiện tại
    const url = new URL(req.url);
    const search = url.search; // ?page=1&limit=3&...

    // Nếu bạn lưu token trong cookie (ví dụ "token"), lấy ra và đính vào Authorization
    const token = (await cookies()).get("access_token")?.value;
    
    const res = await fetch(`${BE}/admin/users${search}`, {
        method: "GET",
        headers: {
            accept: "*/*",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        // credentials: "include", // nếu BE cần cookie, mở dòng này
    });

    const text = await res.text();
    try {
        // trả JSON đúng status
        return NextResponse.json(JSON.parse(text), { status: res.status });
    } catch {
        // BE trả plain text
        return new NextResponse(text, { status: res.status });
    }
}
