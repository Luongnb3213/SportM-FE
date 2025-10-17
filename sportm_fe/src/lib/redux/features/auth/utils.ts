// src/lib/redux/features/auth/utils.ts

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

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
function extractMessage(value: unknown, depth = 0): string | undefined {
    if (depth > 3 || value == null) return undefined;
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed || undefined;
    }
    if (Array.isArray(value)) {
        for (const item of value) {
            const found = extractMessage(item, depth + 1);
            if (found) return found;
        }
        return undefined;
    }
    if (isRecord(value)) {
        const priorityKeys = ["message", "error", "data", "detail"];
        for (const key of priorityKeys) {
            if (key in value) {
                const found = extractMessage(value[key], depth + 1);
                if (found) return found;
            }
        }
        for (const val of Object.values(value)) {
            const found = extractMessage(val, depth + 1);
            if (found) return found;
        }
    }
    return undefined;
}

export function getErrorMessage(data: unknown, fallback = "Request failed"): string {
    return extractMessage(data) ?? fallback;
}
