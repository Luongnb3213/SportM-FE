"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/lib/redux/store";
import { sendOtp, clearAuthError, sendOtpForgot } from "@/lib/redux/features/auth/authSlice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
    title?: string;
    description?: React.ReactNode;
    nextHref: string;                // điều hướng sau khi gửi OTP ok
    mode?: "default" | "forgot";     // ✅ thêm: default = dùng sendOtp, forgot = sendOtpForgot
    buttonText?: string;             // (optional) custom label nút
};

export default function EmailOtpForm({
    title = "",
    description,
    nextHref,
    mode = "default",
    buttonText,
}: Props) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { loading, error } = useSelector((s: RootState) => s.auth);

    const [email, setEmail] = useState("");
    const [localError, setLocalError] = useState<string | null>(null);

    const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!isValidEmail(email)) {
            setLocalError("Email không hợp lệ");
            return;
        }
        setLocalError(null);
        dispatch(clearAuthError());

        // ✅ chọn thunk theo mode
        const action = mode === "forgot" ? sendOtpForgot : sendOtp;

        const res = await dispatch(action(email));
        if (action.fulfilled.match(res)) {
            router.push(nextHref);
        }
    }

    return (
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
            {title && <h2 className="text-center text-[18px] md:text-[20px] font-bold">{title}</h2>}
            {description && <p className="text-center text-sm text-muted-foreground">{description}</p>}

            <div className="space-y-1.5">
                <Label className="pl-4" htmlFor="email">Email</Label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="Nhập email"
                        className="pl-11 h-10 rounded-full"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                {localError && <p className="pl-4 text-xs text-red-600">{localError}</p>}
                {error && <p className="pl-4 text-xs text-red-600">{error}</p>}
            </div>

            <Button disabled={loading} className="w-full h-10 rounded-full bg-[#5f8f53] hover:bg-[#4f7d44]">
                {loading ? "Đang gửi..." : (buttonText ?? "Nhận mã OTP")}
            </Button>
        </form>
    );
}
