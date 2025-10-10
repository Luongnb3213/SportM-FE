"use client";

import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type {
    Advertisement,
    CreateAdBody,
    FetchAdsParams,
    ListAdsPayload,
    PaginationMeta,
    UpdateAdBody,
} from "./types";
import type { RootState } from "@/lib/redux/store";

/** helper: thêm token vào header (nếu có trong redux) */
function authHeader(getState?: () => unknown): Record<string, string> {
    if (!getState) return {};
    const s = getState() as RootState;

    type AuthStateWithToken = RootState["auth"] & {
        token?: string | null;
        accessToken?: string | null;
        user?: (RootState["auth"]["user"] & { accessToken?: string | null }) | null;
    };

    const auth = (s.auth ?? null) as AuthStateWithToken | null;
    const tokenCandidate =
        (auth?.token && typeof auth.token === "string" ? auth.token : null) ||
        (auth?.accessToken && typeof auth.accessToken === "string" ? auth.accessToken : null) ||
        (auth?.user?.accessToken && typeof auth.user.accessToken === "string"
            ? auth.user.accessToken
            : null);

    const token = tokenCandidate ?? undefined;
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
}

function normalizeAdvertisement(ad: Advertisement): Advertisement {
    const rawOrder = (ad as Record<string, unknown>).displayOrder;
    const rawHome = (ad as Record<string, unknown>).displayHome;

    const displayOrder =
        typeof rawOrder === "number" && Number.isFinite(rawOrder)
            ? rawOrder
            : typeof rawOrder === "string" && rawOrder.trim() !== "" && !Number.isNaN(Number(rawOrder))
                ? Number(rawOrder)
                : null;

    const displayHome =
        typeof rawHome === "boolean"
            ? rawHome
            : rawHome == null
                ? null
                : String(rawHome).toLowerCase() === "true"
                    ? true
                    : String(rawHome).toLowerCase() === "false"
                        ? false
                        : Boolean(rawHome);
    return {
        ...ad,
        displayOrder,
        displayHome,
    };
}

/** GET list quảng cáo */
export const fetchAds = createAsyncThunk<
    ListAdsPayload,
    FetchAdsParams,
    { state: RootState; rejectValue: string }
>("ads/fetch", async (params, { rejectWithValue, getState }) => {
    try {
        const qs = new URLSearchParams({
            page: String(params.page),
            limit: String(params.limit),
            ...(params.search ? { search: params.search } : {}),
            ...(typeof params.status === "boolean" ? { status: String(params.status) } : {}),
        }).toString();

        const state = getState();
        const role = (state as RootState).auth.user?.role;
        const basePath = role === "OWNER" ? "/api/manage/ads/me" : "/api/manage/ads";

        const res = await fetch(`${basePath}?${qs}`, {
            method: "GET",
            headers: { accept: "*/*", ...authHeader(getState) },
        });

        if (!res.ok) return rejectWithValue((await res.text()) || "Tải danh sách thất bại");

        const json = (await res.json()) as {
            status: string;
            statusCode: number;
            data: ListAdsPayload;
        };
        return json.data;
    } catch (e: unknown) {
        return rejectWithValue(e instanceof Error ? e.message : "Network error");
    }
});

/** POST tạo quảng cáo */
export const createAd = createAsyncThunk<
    Advertisement,
    CreateAdBody,
    { state: RootState; rejectValue: string }
>("ads/create", async (body, { rejectWithValue, getState }) => {
    try {
        const res = await fetch(`/api/manage/ads`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...authHeader(getState),
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const txt = await res.text();
            let msg = "Tạo quảng cáo thất bại";
            try {
                const j = JSON.parse(txt) as { statusCode?: number; data?: unknown };
                const dataStr = String(j.data ?? "").toLowerCase();
                if (j.statusCode === 500 && dataStr.includes("duplicate key")) msg = "Quảng cáo đã tồn tại";
                if (j.statusCode === 409 || dataStr.includes("already exists")) msg = "Quảng cáo đã tồn tại";
            } catch {
                if (txt.toLowerCase().includes("duplicate key")) msg = "Quảng cáo đã tồn tại";
            }
            return rejectWithValue(msg);
        }

        const json = (await res.json()) as { data: Advertisement };
        return json.data;
    } catch (e: unknown) {
        return rejectWithValue(e instanceof Error ? e.message : "Network error");
    }
});

/** PATCH cập nhật quảng cáo */
export const updateAd = createAsyncThunk<
    Advertisement,
    { id: string; body: UpdateAdBody },
    { state: RootState; rejectValue: string }
>("ads/update", async ({ id, body }, { rejectWithValue, getState }) => {
    try {
        const res = await fetch(`/api/manage/ads/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...authHeader(getState),
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const txt = await res.text();
            let msg = "Cập nhật quảng cáo thất bại";
            try {
                const j = JSON.parse(txt) as { statusCode?: number; data?: unknown };
                const dataStr = String(j.data ?? "").toLowerCase();
                if (j.statusCode === 404 || dataStr.includes("not found")) msg = "Quảng cáo không tồn tại";
            } catch {
                if (txt.toLowerCase().includes("not found")) msg = "Quảng cáo không tồn tại";
            }
            return rejectWithValue(msg);
        }

        const json = (await res.json()) as { data: Advertisement };
        return json.data;
    } catch (e: unknown) {
        return rejectWithValue(e instanceof Error ? e.message : "Network error");
    }
});

/** PATCH cập nhật thứ tự */
export const setAdPriority = createAsyncThunk<
    { id: string; order: number },
    { id: string; order: number },
    { state: RootState; rejectValue: string }
>("ads/setPriority", async ({ id, order }, { rejectWithValue, getState }) => {
    try {
        const res = await fetch(`/api/manage/ads/${id}/priority?order=${order}`, {
            method: "PATCH",
            headers: { ...authHeader(getState) },
        });

        if (!res.ok) return rejectWithValue((await res.text()) || "Cập nhật thứ tự thất bại");
        return { id, order };
    } catch (e: unknown) {
        return rejectWithValue(e instanceof Error ? e.message : "Network error");
    }
});

/** PATCH gắn hoặc bỏ trang chủ */
export const setAdHome = createAsyncThunk<
    { id: string; isHome: boolean },
    { id: string; isHome: boolean },
    { state: RootState; rejectValue: string }
>("ads/setHome", async ({ id, isHome }, { rejectWithValue, getState }) => {
    try {
        const res = await fetch(`/api/manage/ads/${id}/home`, {
            method: "PATCH",
            headers: { ...authHeader(getState) },
        });

        if (!res.ok) return rejectWithValue((await res.text()) || "Gắn trang chủ thất bại");
        return { id, isHome };
    } catch (e: unknown) {
        return rejectWithValue(e instanceof Error ? e.message : "Network error");
    }
});

/** PATCH khôi phục quảng cáo */
export const recoverAd = createAsyncThunk<
    string,
    { id: string },
    { state: RootState; rejectValue: string }
>("ads/recover", async ({ id }, { rejectWithValue, getState }) => {
    try {
        const res = await fetch(`/api/manage/ads/${id}/recover`, {
            method: "PATCH",
            headers: { ...authHeader(getState) },
        });

        if (!res.ok) return rejectWithValue((await res.text()) || "Khôi phục thất bại");
        return id;
    } catch (e: unknown) {
        return rejectWithValue(e instanceof Error ? e.message : "Network error");
    }
});

/** DELETE quảng cáo */
export const deleteAd = createAsyncThunk<
    string,
    { id: string },
    { state: RootState; rejectValue: string }
>("ads/delete", async ({ id }, { rejectWithValue, getState }) => {
    try {
        const res = await fetch(`/api/manage/ads/${id}`, {
            method: "DELETE",
            headers: { ...authHeader(getState) },
        });

        if (!res.ok) return rejectWithValue((await res.text()) || "Xóa thất bại");
        return id;
    } catch (e: unknown) {
        return rejectWithValue(e instanceof Error ? e.message : "Network error");
    }
});

/** Slice setup */
type State = {
    items: Advertisement[];
    meta: PaginationMeta | null;
    loading: boolean;
    error: string | null;
};

const initialState: State = {
    items: [],
    meta: null,
    loading: false,
    error: null,
};

const slice = createSlice({
    name: "ads",
    initialState,
    reducers: {},
    extraReducers: (b) => {
        /** list */
        b.addCase(fetchAds.pending, (s) => {
            s.loading = true;
            s.error = null;
        });
        b.addCase(fetchAds.fulfilled, (s, a: PayloadAction<ListAdsPayload>) => {
            s.loading = false;
            s.items = a.payload.items.map(normalizeAdvertisement);
            s.meta = a.payload.meta;
        });
        b.addCase(fetchAds.rejected, (s, a) => {
            s.loading = false;
            s.error = a.payload ?? "Tải danh sách thất bại";
        });

        /** create */
        b.addCase(createAd.fulfilled, (s, a) => {
            s.items.unshift(normalizeAdvertisement(a.payload));
        });
        /** update */
        b.addCase(updateAd.fulfilled, (s, a) => {
            const idx = s.items.findIndex((x) => x.advertisementId === a.payload.advertisementId);
            if (idx >= 0) s.items[idx] = normalizeAdvertisement(a.payload);
        });

        /** update order */
        b.addCase(setAdPriority.fulfilled, (s, a) => {
            const { id, order } = a.payload;
            const i = s.items.findIndex((x) => x.advertisementId === id);
            if (i >= 0) s.items[i] = { ...s.items[i], displayOrder: order };
        });

        /** toggle home */
        b.addCase(setAdHome.fulfilled, (s, a) => {
            const { id, isHome } = a.payload;
            const i = s.items.findIndex((x) => x.advertisementId === id);
            if (i >= 0) s.items[i] = { ...s.items[i], displayHome: isHome };
        });

        /** recover */
        b.addCase(recoverAd.fulfilled, (s, a) => {
            const id = a.payload;
            const i = s.items.findIndex((x) => x.advertisementId === id);
            if (i >= 0) s.items[i] = { ...s.items[i], status: true };
        });

        /** delete */
        b.addCase(deleteAd.fulfilled, (s, a) => {
            const id = a.payload;
            s.items = s.items.filter((x) => x.advertisementId !== id);
        });
    },
});

export default slice.reducer;
