"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { LoginPayload, LoginResponse, User } from "./types";
import { readJson, getErrorMessage } from "./utils";


// ================== State ==================
type AuthState = {
    user: User | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;

    // OTP flow
    otpEmail: string | null;
    otpSent: boolean;
    otpVerified: boolean;
};

const initialState: AuthState = {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,

    otpEmail: null,
    otpSent: false,
    otpVerified: false,
};



/** Login qua API route nội bộ (để set cookie server-side) */
export const login = createAsyncThunk<
    LoginResponse["data"],
    LoginPayload,
    { rejectValue: string }
>("auth/login", async (body, { rejectWithValue }) => {
    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const data = await readJson<unknown>(res);
            return rejectWithValue(getErrorMessage(data, "Đăng nhập thất bại"));
        }

        const json = (await res.json()) as LoginResponse;
        return json.data;
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Network error";
        return rejectWithValue(msg);
    }
});

// Gửi OTP
export const sendOtp = createAsyncThunk<
    { email: string },
    string,
    { rejectValue: string }
>("auth/sendOtp", async (email, { rejectWithValue }) => {
    try {
        const res = await fetch("/api/auth/send-otp-signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        if (!res.ok) {

            const data = await readJson<{
                status?: string;
                statusCode?: number;
                data?: string;
            }>(res);

            if (data?.statusCode === 409 && data?.data?.includes("User")) {
                return rejectWithValue("Email đã tồn tại");
            }
            return rejectWithValue(getErrorMessage(data, "Gửi OTP thất bại"));
        }

        return { email };
    } catch (err: unknown) {
        if (err instanceof Error) {
            return rejectWithValue(err.message);
        }
        return rejectWithValue("Network error");
    }
});

// Verify OTP
export const verifyOtp = createAsyncThunk<
    { email: string },
    { email: string; code: string },
    { rejectValue: string }
>("auth/verifyOtp", async ({ email, code }, { rejectWithValue }) => {
    try {
        const res = await fetch("/api/auth/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp: code }),
        });
        if (!res.ok) {
            const data = await readJson<unknown>(res);
            return rejectWithValue(getErrorMessage(data, "Xác thực OTP thất bại"));
        }
        return { email };
    } catch (err: unknown) {
        if (err instanceof Error) {
            return rejectWithValue(err.message);
        }
        return rejectWithValue("Network error");
    }
});

// Signup
export const signup = createAsyncThunk<
    User,
    { email: string; password: string; fullName: string; phone: string },
    { rejectValue: string }
>("auth/signup", async (payload, { rejectWithValue }) => {
    try {
        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const data = await readJson<unknown>(res);
            return rejectWithValue(getErrorMessage(data, "Đăng ký thất bại"));
        }
        const data = await readJson<User>(res);
        if (!data) return rejectWithValue("Đăng ký thất bại");
        return data;
    } catch (err: unknown) {
        if (err instanceof Error) {
            return rejectWithValue(err.message);
        }
        return rejectWithValue("Network error");
    }
});

export const sendOtpForgot = createAsyncThunk<
    { email: string },
    string,
    { rejectValue: string }
>("auth/sendOtpForgot", async (email, { rejectWithValue }) => {
    try {
        const res = await fetch("/api/auth/send-otp-forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        if (!res.ok) {
            const data = await readJson<{ statusCode?: number; data?: string }>(res);
            if (data?.statusCode === 404 || (data?.data ?? "").toLowerCase().includes("not found")) {
                return rejectWithValue("Email không tồn tại");
            }
            return rejectWithValue(getErrorMessage(data, "Gửi OTP thất bại"));
        }

        return { email };
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Network error";
        return rejectWithValue(msg);
    }
});

// Đặt lại mật khẩu (sau khi verify OTP)
export const resetPassword = createAsyncThunk<
    { ok: true },
    { email: string; newPassword: string },
    { rejectValue: string }
>("auth/resetPassword", async ({ email, newPassword }, { rejectWithValue }) => {
    try {
        const res = await fetch("/api/auth/update-password", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, newPassword }),
        });

        if (!res.ok) {
            const data = await readJson<{ statusCode?: number; data?: string }>(res);
            return rejectWithValue(getErrorMessage(data, "Đặt lại mật khẩu thất bại"));
        }
        return { ok: true };
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Network error";
        return rejectWithValue(msg);
    }
});


// ================== Slice ==================
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logoutClient(state) {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;

            // reset otp flow
            state.otpEmail = null;
            state.otpSent = false;
            state.otpVerified = false;
        },
        setUserFromCookie(state, action: PayloadAction<User | null>) {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        },
        clearAuthError(state) {
            state.error = null;
        },
        resetOtpFlow(state) {
            state.otpEmail = null;
            state.otpSent = false;
            state.otpVerified = false;
        },
    },
    extraReducers: (builder) => {
        // LOGIN
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
                state.error = action.payload ?? "Đăng nhập thất bại";
            });

        // SEND OTP
        builder
            .addCase(sendOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.otpSent = false;
            })
            .addCase(sendOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.otpSent = true;
                state.otpEmail = action.payload.email;
            })
            .addCase(sendOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Gửi OTP thất bại";
            });

        // VERIFY OTP
        builder
            .addCase(verifyOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.otpVerified = false;
            })
            .addCase(verifyOtp.fulfilled, (state) => {
                state.loading = false;
                state.otpVerified = true;
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Xác thực OTP thất bại";
            });

        // SIGNUP
        builder
            .addCase(signup.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signup.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;

                // reset otp state
                state.otpEmail = null;
                state.otpSent = false;
                state.otpVerified = false;
            })
            .addCase(signup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Đăng ký thất bại";
            });
        builder
            .addCase(sendOtpForgot.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.otpSent = false;
            })
            .addCase(sendOtpForgot.fulfilled, (state, action) => {
                state.loading = false;
                state.otpSent = true;
                state.otpEmail = action.payload.email;
            })
            .addCase(sendOtpForgot.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Gửi OTP thất bại";
            });
        builder
            .addCase(resetPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(resetPassword.fulfilled, (state) => {
                state.loading = false;
                // clear OTP flow sau khi reset thành công
                state.otpEmail = null;
                state.otpSent = false;
                state.otpVerified = false;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Đặt lại mật khẩu thất bại";
            });
    },
});

export const { logoutClient, setUserFromCookie, clearAuthError, resetOtpFlow } =
    authSlice.actions;

export default authSlice.reducer;
