// components/auth/VerifyOtpBlock.tsx
"use client";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/lib/redux/store";
import { verifyOtp, sendOtp, sendOtpForgot, clearAuthError } from "@/lib/redux/features/auth/authSlice";
import OtpInput from "@/components/auth/OtpInput";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

type Props = {
    nextHref: string;              // điều hướng sau khi verify ok
    emailOverride?: string;        // ép email khác (nếu cần)
    mode?: "default" | "forgot";   // default = đăng ký/đăng nhập ; forgot = quên mật khẩu
    onSuccess?: () => void;        // optional: callback (VD bắn toast)
};

export default function VerifyOtpBlock({
    nextHref,
    emailOverride,
    mode = "default",
    onSuccess,
}: Props) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { loading, error, otpEmail } = useSelector((s: RootState) => s.auth);
    const email = useMemo(() => emailOverride || otpEmail || "", [emailOverride, otpEmail]);

    const [code, setCode] = useState("");

    function maskEmail(e: string) {
        if (!e) return "";
        const [name, domain] = e.split("@");
        if (!domain) return e;
        const masked = name.length <= 2 ? name[0] + "*" : name.slice(0, 2) + "*****";
        return `${masked}@${domain}`;
    }

    async function onSubmit() {
        if (code.length !== 6 || !email) return;
        dispatch(clearAuthError());
        const r = await dispatch(verifyOtp({ email, code }));
        if (verifyOtp.fulfilled.match(r)) {
            onSuccess?.();            // 👈 bắn toast nếu truyền vào
            router.push(nextHref);
        }
    }

    async function onResend() {
        if (!email) return;
        // 👇 resend đúng thunk theo mode
        if (mode === "forgot") {
            await dispatch(sendOtpForgot(email));
        } else {
            await dispatch(sendOtp(email));
        }
    }

    return (
        <div className="space-y-4">
            <p className="text-center text-sm">
                Nhập mã OTP đã gửi qua <span className="font-semibold">{maskEmail(email)}</span>
            </p>

            <OtpInput length={6} onChange={setCode} />
            {error && <p className="text-center text-xs text-red-600">{error}</p>}

            <div className="text-center text-sm">
                Bạn chưa nhận được mã OTP?{" "}
                <button type="button" onClick={onResend} className="text-[#4f7d44] hover:underline">
                    Gửi lại mã OTP
                </button>
            </div>

            <Button
                disabled={loading || code.length !== 6}
                onClick={onSubmit}
                className="w-full h-10 rounded-full bg-[#5f8f53] hover:bg-[#4f7d44] disabled:opacity-60"
            >
                {loading ? "Đang xác nhận..." : "Xác nhận"}
            </Button>
        </div>
    );
}
