"use client";

import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/lib/redux/store";
import type {
    Court,
    CreateCourtBody,
    FetchCourtsParams,
    ListCourtsPayload,
    UpdateCourtBody,
} from "./types";

type CourtsState = {
    items: Court[];
    meta: ListCourtsPayload["meta"] | null;
    loading: boolean;
    error: string | null;
};

const initialState: CourtsState = {
    items: [],
    meta: null,
    loading: false,
    error: null,
};

/** helper: thêm token vào header (nếu có) */
function authHeader(getState?: () => unknown): Record<string, string> {
    if (!getState) return {};
    const state = getState() as RootState;

    type AuthState = RootState["auth"] & {
        token?: string | null;
        accessToken?: string | null;
        user?: (RootState["auth"]["user"] & { accessToken?: string | null }) | null;
    };

    const auth = (state.auth ?? null) as AuthState | null;
    const tokenCandidate =
        (auth?.token && typeof auth.token === "string" ? auth.token : null) ||
        (auth?.accessToken && typeof auth.accessToken === "string" ? auth.accessToken : null) ||
        (auth?.user?.accessToken && typeof auth.user.accessToken === "string"
            ? auth.user.accessToken
            : null);

    const headers: Record<string, string> = {};
    if (tokenCandidate) headers.Authorization = `Bearer ${tokenCandidate}`;
    return headers;
}

function normalizeCourt(court: Court): Court {
    const images = Array.isArray(court.courtImages)
        ? court.courtImages.filter((img): img is string => typeof img === "string" && img.trim() !== "")
        : [];

    const lat =
        typeof court.lat === "number" && Number.isFinite(court.lat)
            ? court.lat
            : court.lat == null
                ? null
                : Number.isNaN(Number(court.lat))
                    ? null
                    : Number(court.lat);

    const lng =
        typeof court.lng === "number" && Number.isFinite(court.lng)
            ? court.lng
            : court.lng == null
                ? null
                : Number.isNaN(Number(court.lng))
                    ? null
                    : Number(court.lng);

    return {
        ...court,
        courtImages: images,
        lat,
        lng,
    };
}

export const fetchCourts = createAsyncThunk<
    ListCourtsPayload,
    FetchCourtsParams,
    { state: RootState; rejectValue: string }
>("courts/fetch", async (params, { getState, rejectWithValue }) => {
    try {
        const qs = new URLSearchParams({
            page: String(params.page),
            limit: String(params.limit),
            ...(params.search ? { search: params.search } : {}),
            ...(params.sportTypeId ? { sportTypeId: params.sportTypeId } : {}),
        }).toString();

        const res = await fetch(`/api/manage/courts?${qs}`, {
            method: "GET",
            headers: { accept: "*/*", ...authHeader(getState) },
        });

        if (!res.ok) return rejectWithValue((await res.text()) || "Tải danh sách sân thất bại");

        const json = (await res.json()) as {
            status: string;
            statusCode: number;
            data: ListCourtsPayload;
        };

        const data = {
            items: json.data.items.map(normalizeCourt),
            meta: json.data.meta,
        };

        return data;
    } catch (e: unknown) {
        return rejectWithValue(e instanceof Error ? e.message : "Network error");
    }
});

export const createCourt = createAsyncThunk<
    Court,
    CreateCourtBody,
    { state: RootState; rejectValue: string }
>("courts/create", async (body, { getState, rejectWithValue }) => {
    try {
        const res = await fetch(`/api/manage/courts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...authHeader(getState),
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const txt = await res.text();
            let msg = "Tạo sân thất bại";
            try {
                const json = JSON.parse(txt) as { statusCode?: number; data?: unknown };
                if (json.statusCode === 409) msg = "Sân đã tồn tại";
            } catch {
                // ignore parse error
            }
            return rejectWithValue(msg);
        }

        const json = (await res.json()) as { data: Court };
        return normalizeCourt(json.data);
    } catch (e: unknown) {
        return rejectWithValue(e instanceof Error ? e.message : "Network error");
    }
});

export const updateCourt = createAsyncThunk<
    Court,
    { id: string; body: UpdateCourtBody },
    { state: RootState; rejectValue: string }
>("courts/update", async ({ id, body }, { getState, rejectWithValue }) => {
    try {
        const res = await fetch(`/api/manage/courts/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...authHeader(getState),
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const txt = await res.text();
            let msg = "Cập nhật sân thất bại";
            try {
                const json = JSON.parse(txt) as { statusCode?: number; data?: unknown };
                if (json.statusCode === 404) msg = "Không tìm thấy sân";
            } catch {
                // ignore
            }
            return rejectWithValue(msg);
        }

        const json = (await res.json()) as { data: Court };
        return normalizeCourt(json.data);
    } catch (e: unknown) {
        return rejectWithValue(e instanceof Error ? e.message : "Network error");
    }
});

const courtsSlice = createSlice({
    name: "courts",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCourts.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.items = [];
                state.meta = null;
            })
            .addCase(fetchCourts.fulfilled, (state, action: PayloadAction<ListCourtsPayload>) => {
                state.loading = false;
                state.items = action.payload.items;
                state.meta = action.payload.meta;
            })
            .addCase(fetchCourts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Tải danh sách sân thất bại";
            })
            .addCase(createCourt.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })
            .addCase(updateCourt.fulfilled, (state, action) => {
                const updated = action.payload;
                const idx = state.items.findIndex((item) => item.courtId === updated.courtId);
                if (idx >= 0) state.items[idx] = updated;
            });
    },
});

export default courtsSlice.reducer;
