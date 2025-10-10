import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/lib/redux/store";
import type {
    Subscription,
    CreateSubscriptionBody,
    UpdateSubscriptionBody,
} from "./types";

type State = {
    items: Subscription[];
    loading: boolean;
    saving: boolean;
    error: string | null;
};

const initialState: State = {
    items: [],
    loading: false,
    saving: false,
    error: null,
};

export const fetchSubscriptions = createAsyncThunk<
    Subscription[],
    void,
    { rejectValue: string }
>("subscriptions/fetchAll", async (_, { rejectWithValue }) => {
    try {
        const res = await fetch("/api/manage/packages", { method: "GET" });
        if (!res.ok) {
            const txt = await res.text();
            return rejectWithValue(txt || "Tải danh sách gói thất bại");
        }
        const json = (await res.json()) as {
            status: string;
            statusCode: number;
            data: Subscription[];
        };
        return json.data;
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Network error";
        return rejectWithValue(message);
    }
});

export const createSubscription = createAsyncThunk<
    Subscription,
    CreateSubscriptionBody,
    { rejectValue: string }
>("subscriptions/create", async (body, { rejectWithValue }) => {
    try {
        const res = await fetch("/api/manage/packages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const txt = await res.text();
            return rejectWithValue(txt || "Tạo gói thất bại");
        }
        const json = (await res.json()) as {
            status: string;
            statusCode: number;
            data: Subscription;
        };
        return json.data;
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Network error";
        return rejectWithValue(message);
    }
});

export const updateSubscription = createAsyncThunk<
    Subscription,
    { id: string; body: UpdateSubscriptionBody },
    { rejectValue: string }
>("subscriptions/update", async ({ id, body }, { rejectWithValue }) => {
    try {
        const res = await fetch(`/api/manage/packages/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const txt = await res.text();
            return rejectWithValue(txt || "Cập nhật gói thất bại");
        }
        const json = (await res.json()) as {
            status: string;
            statusCode: number;
            data: Subscription;
        };
        return json.data;
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Network error";
        return rejectWithValue(message);
    }
});

const slice = createSlice({
    name: "subscriptions",
    initialState,
    reducers: {
        clearSubscriptionsError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSubscriptions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSubscriptions.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchSubscriptions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Tải danh sách gói thất bại";
            })
            .addCase(createSubscription.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(createSubscription.fulfilled, (state, action) => {
                state.saving = false;
                state.items.unshift(action.payload);
            })
            .addCase(createSubscription.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload ?? "Tạo gói thất bại";
            })
            .addCase(updateSubscription.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(updateSubscription.fulfilled, (state, action) => {
                state.saving = false;
                const idx = state.items.findIndex(
                    (item) => item.subscriptionId === action.payload.subscriptionId,
                );
                if (idx >= 0) state.items[idx] = action.payload;
            })
            .addCase(updateSubscription.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload ?? "Cập nhật gói thất bại";
            });
    },
});

export const { clearSubscriptionsError } = slice.actions;
export const selectSubscriptions = (state: RootState) => state.subscriptions;
export default slice.reducer;
