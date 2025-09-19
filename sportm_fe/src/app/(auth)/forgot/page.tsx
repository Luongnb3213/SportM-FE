// app/forgot/page.tsx
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/lib/redux/store";
import { clearAuthError, resetPassword } from "@/lib/redux/features/auth/authSlice";
import AuthShell from "@/components/auth/AuthShell";
import EmailOtpForm from "@/components/auth/EmailOtpForm";
import VerifyOtpBlock from "@/components/auth/VerifyOtpBlock";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
function BackToLogin() {
    return (
        <p className="text-sm text-center mt-2">
            Nhớ mật khẩu rồi?{" "}
            <Link href="/login" className="underline text-[#5f8f53] hover:text-[#4f7d44]">
                Đăng nhập
            </Link>
        </p>
    );
}

export default function ForgotPage() {
    const router = useRouter();
    const sp = useSearchParams();
    const step = sp.get("step") || "email";
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error, otpEmail, otpVerified } = useSelector((s: RootState) => s.auth);

    // clear lỗi mỗi khi đổi step & khi unmount
    useEffect(() => {
        dispatch(clearAuthError());
        return () => { dispatch(clearAuthError()); };
    }, [dispatch, step]);

    // ---------- Step 1: nhập email ----------
    if (step === "email") {
        return (
            <AuthShell
                title="Quên mật khẩu"
                description={<>Nhập email để nhận mã OTP đặt lại mật khẩu.</>}
            >
                <EmailOtpForm
                    mode="forgot"                 // dùng API forgot
                    nextHref="/forgot?step=otp"   // chuyển sang bước nhập OTP
                    buttonText="Gửi OTP"
                />
                <BackToLogin />
            </AuthShell>
        );
    }

    // ---------- Step 2: nhập OTP ----------
    if (step === "otp") {
        return (
            <AuthShell title="Nhập mã OTP">
                <VerifyOtpBlock
                    mode="forgot"                       // resend đúng thunk forgot
                    emailOverride={otpEmail ?? ""}      // đảm bảo có email
                    nextHref="/forgot?step=reset"       // sang bước đặt mật khẩu
                    onSuccess={() => toast.success("OTP hợp lệ. Mời bạn đặt lại mật khẩu.")}
                />
                <BackToLogin />
            </AuthShell>
        );
    }

    // ---------- Step 3: đặt lại mật khẩu ----------
    return (
        <AuthShell title="Đặt lại mật khẩu">
            <ResetPasswordForm
                email={otpEmail ?? ""}
                enabled={otpVerified}
                loading={loading}
                error={error ?? undefined}
                onReset={async ({ email, password }) => {
                    const r = await dispatch(resetPassword({ email, newPassword: password }));
                    if (resetPassword.fulfilled.match(r)) {
                        toast.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập.");
                        router.push("/login");
                    }
                }}
            />
            <BackToLogin />
        </AuthShell>
    );
}

/* ======= Form đặt lại mật khẩu ======= */
function ResetPasswordForm({
    email, enabled, loading, error, onReset,
}: {
    email: string;
    enabled?: boolean;
    loading?: boolean;
    error?: string;
    onReset: (v: { email: string; password: string }) => Promise<void>;
}) {
    const [pw, setPw] = useState("");
    const [cf, setCf] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [showCf, setShowCf] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!enabled) { setLocalError("Bạn cần xác thực OTP trước."); return; }
        if (pw.length < 6) { setLocalError("Mật khẩu tối thiểu 6 ký tự."); return; }
        if (pw !== cf) { setLocalError("Mật khẩu nhập lại không khớp."); return; }
        setLocalError(null);
        await onReset({ email, password: pw });
    }
    function maskEmail(e: string) {
        if (!e) return "";
        const [name, domain] = e.split("@");
        if (!domain) return e;
        const masked = name.length <= 2 ? name[0] + "*" : name.slice(0, 2) + "*****";
        return `${masked}@${domain}`;
    }

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <p className="text-sm text-muted-foreground text-center">
                Email: <b>{maskEmail(email) || "—"}</b>
            </p>
            <div className="space-y-1.5">
                <label htmlFor="pw" className="pl-4 text-sm">Mật khẩu mới</label>
                <div className="relative">
                    <Input
                        id="pw"
                        type={showPw ? "text" : "password"}
                        className="h-11 rounded-full pr-11"
                        placeholder="Nhập mật khẩu mới"
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPw(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-70 hover:opacity-100"
                        aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                        {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Nhập lại mật khẩu */}
            <div className="space-y-1.5">
                <label htmlFor="cf" className="pl-4 text-sm">Nhập lại mật khẩu</label>
                <div className="relative">
                    <Input
                        id="cf"
                        type={showCf ? "text" : "password"}
                        className="h-11 rounded-full pr-11"
                        placeholder="Nhập lại mật khẩu"
                        value={cf}
                        onChange={(e) => setCf(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={() => setShowCf(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-70 hover:opacity-100"
                        aria-label={showCf ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                        {showCf ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {(localError || error) && (
                <p className="text-sm text-red-600 text-center">{localError || error}</p>
            )}

            <Button
                type="submit"
                disabled={loading || !enabled}
                className="w-full h-11 rounded-full bg-[#5f8f53] hover:bg-[#4f7d44]"
            >
                {loading ? "Đang cập nhật..." : "Đổi mật khẩu"}
            </Button>

            <Separator className="my-4" />
        </form>
    );


}
