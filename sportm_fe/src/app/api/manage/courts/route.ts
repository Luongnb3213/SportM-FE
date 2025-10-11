import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_BASE =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.API_BASE ||
    process.env.API_URL ||
    "https://sportmbe.onrender.com";

function buildHeaders(token: string | undefined, extra?: HeadersInit) {
    return {
        accept: "*/*",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(extra ?? {}),
    };
}

function resolveToken(raw?: string) {
    if (!raw) return undefined;
    try {
        return decodeURIComponent(raw);
    } catch {
        return raw;
    }
}

async function proxyResponse(res: Response) {
    const text = await res.text();
    try {
        return NextResponse.json(JSON.parse(text), { status: res.status });
    } catch {
        return new NextResponse(text, { status: res.status });
    }
}

function validateCourtPayload(payload: unknown): { ok: true } | { ok: false; message: string } {
    if (!payload || typeof payload !== "object") return { ok: false, message: "Dữ liệu không hợp lệ" };

    const data = payload as Record<string, unknown>;
    if (typeof data.name !== "string" || data.name.trim() === "") return { ok: false, message: "Tên sân là bắt buộc" };
    if (typeof data.address !== "string" || data.address.trim() === "") return { ok: false, message: "Địa chỉ là bắt buộc" };
    if (typeof data.sportType !== "string" || data.sportType.trim() === "") return { ok: false, message: "Vui lòng chọn loại hình thể thao" };

    if (!Array.isArray(data.imgUrls) || data.imgUrls.length === 0) {
        return { ok: false, message: "Cần ít nhất một đường dẫn ảnh" };
    }

    return { ok: true };
}

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const qs = url.search; // ?page=&limit=&sportTypeId=&search=
        const token = resolveToken((await cookies()).get("access_token")?.value);

        const res = await fetch(`${API_BASE}/owner/courts${qs}`, {
            method: "GET",
            headers: buildHeaders(token),
        });

        return await proxyResponse(res);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = resolveToken((await cookies()).get("access_token")?.value);
        const textBody = await req.text();

        let payload: unknown;
        try {
            payload = textBody ? JSON.parse(textBody) : null;
        } catch {
            return NextResponse.json({ statusCode: 400, data: "Dữ liệu không hợp lệ" }, { status: 400 });
        }

        const validation = validateCourtPayload(payload);
        if (!validation.ok) {
            return NextResponse.json({ statusCode: 400, data: validation.message }, { status: 400 });
        }

        const res = await fetch(`${API_BASE}/owner/courts`, {
            method: "POST",
            headers: buildHeaders(token, { "Content-Type": "application/json" }),
            body: textBody,
        });

        return await proxyResponse(res);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
