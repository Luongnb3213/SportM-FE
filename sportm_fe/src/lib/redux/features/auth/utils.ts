// src/lib/redux/features/auth/utils.ts

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

/** fetch kèm base URL + header JSON mặc định */
export async function api(path: string, init?: RequestInit): Promise<Response> {
    const headers = new Headers({ "Content-Type": "application/json" });
    if (init?.headers) {
        const h = new Headers(init.headers as HeadersInit);
        h.forEach((v, k) => headers.set(k, v));
    }
    return fetch(`${API_BASE}${path}`, {
        ...init,
        headers,
    });
}

/** Đọc JSON an toàn từ Response (kể cả khi body rỗng) */
export async function readJson<T>(res: Response): Promise<T | null> {
    const text = await res.text();
    if (!text) return null;
    try {
        return JSON.parse(text) as T;
    } catch {
        return null;
    }
}

/** Type guard: object record thuần */
function isRecord(x: unknown): x is Record<string, unknown> {
    return typeof x === "object" && x !== null;
}

/** Lấy thông điệp lỗi hữu ích từ payload JSON */
export function getErrorMessage(data: unknown, fallback = "Request failed"): string {
    if (!data) return fallback;
    if (typeof data === "string") return data;
    if (isRecord(data)) {
        if (typeof data.error === "string" && data.error) return data.error;
        if (typeof data.message === "string" && data.message) return data.message;
    }
    return fallback;
}
