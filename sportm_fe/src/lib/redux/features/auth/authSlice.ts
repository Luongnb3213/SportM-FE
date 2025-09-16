"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { LoginPayload, LoginResponse, User } from "./types";

type AuthState = {
    user: User | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
};

const initialState: AuthState = {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
};

// Thunk: gọi API route để login và set cookie server-side
export const login = createAsyncThunk<LoginResponse["data"], LoginPayload, { rejectValue: string }>(
    "auth/login",
    async (body, { rejectWithValue }) => {
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const json = await res.json().catch(() => null);
                return rejectWithValue(  json?.error || json?.message || 'Đăng nhập thất bại' );
            }
            const json: LoginResponse = await res.json();
            return json.data;
        } catch (err: unknown) {
            if (err instanceof Error) {
                return rejectWithValue(err.message);
            }
            return rejectWithValue("Network error");
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logoutClient(state) {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        setUserFromCookie(state, action: PayloadAction<User | null>) {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Login failed";
            });
    },
});

export const { logoutClient, setUserFromCookie } = authSlice.actions;
export default authSlice.reducer;
