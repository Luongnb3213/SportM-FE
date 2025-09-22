"use client";

import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { PaginationMeta } from "@/lib/redux/types";

/** BE trả thế này:
 * { sportTypeId: string; typeName: string; status: boolean }
 */
export type SportType = {
    sportTypeId: string;
    typeName: string;
    status: boolean;
};

export type FetchParams = { page: number; limit: number; search?: string };

type ListPayload = { items: SportType[]; meta: PaginationMeta };

/** GET list (proxy qua API nội bộ) */
export const fetchSportTypes = createAsyncThunk<
    ListPayload,
    FetchParams,
    { rejectValue: string }
>("sportTypes/fetch", async (params, { rejectWithValue }) => {
    try {
        const qs = new URLSearchParams({
            page: String(params.page),
            limit: String(params.limit),
            ...(params.search ? { search: params.search } : {}),
        }).toString();

        const res = await fetch(`/api/manage/sport-type?${qs}`, { method: "GET" });
        if (!res.ok) return rejectWithValue((await res.text()) || "Tải danh sách thất bại");

        const json = (await res.json()) as {
            status: string;
            statusCode: number;
            data: ListPayload;
        };
        return json.data;
    } catch (e: unknown) {
        return rejectWithValue(e instanceof Error ? e.message : "Network error");
    }
});

/** POST create */
export const createSportType = createAsyncThunk<
    SportType,
    { name: string },
    { rejectValue: string }
>("sportTypes/create", async (body, { rejectWithValue }) => {
    try {
        const res = await fetch(`/api/manage/sport-type`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body), // { typeName }
        });
        if (!res.ok) return rejectWithValue((await res.text()) || "Tạo mới thất bại");

        const json = (await res.json()) as { data: SportType };
        return json.data;
    } catch (e: unknown) {
        return rejectWithValue(e instanceof Error ? e.message : "Network error");
    }
});

/** PATCH update */
export const updateSportType = createAsyncThunk<
    SportType,
    { id: string; name: string },
    { rejectValue: string }
>("sportTypes/update", async ({ id, name }, { rejectWithValue }) => {
    try {
        const res = await fetch(`/api/manage/sport-type/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        });
        if (!res.ok) return rejectWithValue((await res.text()) || "Cập nhật thất bại");

        const json = (await res.json()) as { data: SportType };
        return json.data;
    } catch (e: unknown) {
        return rejectWithValue(e instanceof Error ? e.message : "Network error");
    }
});

/** DELETE */
export const deleteSportType = createAsyncThunk<
    string,
    { id: string },
    { rejectValue: string }
>("sportTypes/delete", async ({ id }, { rejectWithValue }) => {
    try {
        const res = await fetch(`/api/manage/sport-type/${id}`, { method: "DELETE" });
        if (!res.ok) return rejectWithValue((await res.text()) || "Xóa thất bại");
        return id;
    } catch (e: unknown) {
        return rejectWithValue(e instanceof Error ? e.message : "Network error");
    }
});

type State = {
    items: SportType[];
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
    name: "sportTypes",
    initialState,
    reducers: {},
    extraReducers: (b) => {
        // list
        b.addCase(fetchSportTypes.pending, (s) => {
            s.loading = true;
            s.error = null;
        });
        b.addCase(fetchSportTypes.fulfilled, (s, a: PayloadAction<ListPayload>) => {
            s.loading = false;
            s.items = a.payload.items;
            s.meta = a.payload.meta;
        });
        b.addCase(fetchSportTypes.rejected, (s, a) => {
            s.loading = false;
            s.error = a.payload ?? "Tải danh sách thất bại";
        });

        // create
        b.addCase(createSportType.fulfilled, (s, a) => {
            s.items.unshift(a.payload);
        });

        // update
        b.addCase(updateSportType.fulfilled, (s, a) => {
            const upd = a.payload;
            const i = s.items.findIndex((x) => x.sportTypeId === upd.sportTypeId);
            if (i >= 0) s.items[i] = upd;
        });

        // delete
        b.addCase(deleteSportType.fulfilled, (s, a) => {
            const id = a.payload; // id truyền vào thunk
            s.items = s.items.filter((x) => x.sportTypeId !== id);
        });
    },
});

export default slice.reducer;
