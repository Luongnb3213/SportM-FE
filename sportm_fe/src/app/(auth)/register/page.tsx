"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/lib/redux/store";
import { clearAuthError, signup } from "@/lib/redux/features/auth/authSlice";
import AuthShell from "@/components/auth/AuthShell";
import EmailOtpForm from "@/components/auth/EmailOtpForm";
import VerifyOtpBlock from "@/components/auth/VerifyOtpBlock";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { bigShoulders, openSans } from "@/styles/fonts";
import { Lock, User, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

function BackToLogin() {
    return (
        <p className="text-sm text-center mt-2">
            Đã có tài khoản?{" "}
            <Link href="/login" className="underline text-[#5f8f53] hover:text-[#4f7d44]">
                Đăng nhập
            </Link>
        </p>
    );
}

export default function RegisterPage() {
    const router = useRouter();
    const sp = useSearchParams();
    const step = sp.get("step") || "email";
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error, otpEmail, otpVerified, isAuthenticated } = useSelector((s: RootState) => s.auth);

    useEffect(() => {
        if (isAuthenticated) router.push("/");
    }, [isAuthenticated, router]);

    useEffect(() => {
        dispatch(clearAuthError());
        return () => { dispatch(clearAuthError()); };
    }, [dispatch, step]);

    // ---------- Step email ----------
    if (step === "email") {
        return (
            <AuthShell
                title="Nhập email"
                description={<>Chúng tôi sẽ gửi mã OTP qua email của bạn. OTP có hiệu lực trong vòng 15 phút.</>}
            >
                <EmailOtpForm nextHref="/register?step=otp" />
                <BackToLogin />
            </AuthShell>
        );
    }

    // ---------- Step otp ----------
    if (step === "otp") {
        return (
            <AuthShell title="Nhập mã OTP">
                <VerifyOtpBlock nextHref="/register?step=form" />
                <BackToLogin />
            </AuthShell>
        );
    }

    // ---------- Step form (signup) ----------
    return (
        <div className="min-h-svh flex">
            <div className="hidden md:block basis-[65%] relative">
                <Image src="/images/login-hero.jpg" alt="Sport court" fill priority className="object-cover" />
            </div>

            <div className="flex-1 basis-[35%] relative flex items-stretch p-6 md:p-12">
                <div className="w-full max-w-[360px] mx-auto flex flex-col h-full">
                    <div className="pt-10 md:pt-16 lg:pt-20 xl:pt-24">
                        <h1 className={`text-[64px] font-semibold text-[#669250] text-center ${bigShoulders.className}`}>
                            <Link href="/">SPORTM</Link>
                        </h1>
                        <h2 className="text-[20px] font-bold leading-[28px] text-center mb-6">Đăng ký</h2>

                        {!otpVerified && (
                            <p className="text-sm text-center text-red-600 mb-3">
                                Bạn cần xác thực OTP trước.{" "}
                                <button onClick={() => router.replace("/register?step=email")} className="underline">Quay lại</button>
                            </p>
                        )}

                        <SignupForm
                            email={otpEmail ?? ""}
                            disabled={!otpVerified}
                            loading={loading}
                            error={error ?? undefined}
                            onSubmit={async (data) => {
                                const r = await dispatch(signup({ ...data, email: otpEmail ?? "" }));
                                if (signup.fulfilled.match(r)) {
                                    toast.success("Đăng ký thành công! Bạn có thể đăng nhập ngay.");
                                    router.push("/login");
                                }
                            }}
                        />
                    </div>

                    <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                        <span className={`${bigShoulders.className} text-lg text-[#4c8c52]`}>SPORTM</span>
                        <span>© {new Date().getFullYear()} SPORTM</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SignupForm({
    email,
    disabled,
    loading,
    error,
    onSubmit,
}: {
    email: string;
    disabled?: boolean;
    loading?: boolean;
    error?: string;
    onSubmit: (v: { fullName: string; phone: string; password: string }) => Promise<void>;
}) {
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [localError, setLocalError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email) { setLocalError("Thiếu email đã xác thực."); return; }
        if (!fullName.trim()) { setLocalError("Vui lòng nhập họ tên."); return; }
        if (!phone.trim()) { setLocalError("Vui lòng nhập số điện thoại."); return; }
        if (password.length < 6) { setLocalError("Mật khẩu tối thiểu 6 ký tự."); return; }
        if (password !== confirm) { setLocalError("Mật khẩu nhập lại không khớp."); return; }
        setLocalError(null);
        await onSubmit({ fullName, phone, password });
    }

    return (
        <form className={`space-y-4 ${openSans.className}`} onSubmit={handleSubmit}>
            <p className="text-sm text-muted-foreground text-center">
                Email đã xác thực: <b>{email || "—"}</b>
            </p>

            <div className="space-y-1.5">
                <Label className="pl-4" htmlFor="name">Tên đầy đủ</Label>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
                    <Input id="name" type="text" placeholder="Nhập họ và tên" className="pl-11 h-10 rounded-full"
                        value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={disabled} />
                </div>
            </div>

            <div className="space-y-1.5">
                <Label className="pl-4" htmlFor="phone">Số điện thoại</Label>
                <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
                    <Input id="phone" type="tel" placeholder="Nhập số điện thoại" className="pl-11 h-10 rounded-full"
                        value={phone} onChange={(e) => setPhone(e.target.value)} disabled={disabled} />
                </div>
            </div>

            <div className="space-y-1.5">
                <Label className="pl-4" htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
                    <Input id="password" type="password" placeholder="Nhập mật khẩu" className="pl-11 h-10 rounded-full"
                        value={password} onChange={(e) => setPassword(e.target.value)} disabled={disabled} />
                </div>
            </div>

            <div className="space-y-1.5">
                <Label className="pl-4" htmlFor="confirm">Nhập lại mật khẩu</Label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
                    <Input id="confirm" type="password" placeholder="Nhập lại mật khẩu" className="pl-11 h-10 rounded-full"
                        value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={disabled} />
                </div>
            </div>

            {(localError || error) && (
                <p className="text-center text-sm text-red-600">{localError || error}</p>
            )}

            <Button type="submit" disabled={disabled || loading}
                className="w-full h-10 rounded-full bg-[#5f8f53] hover:bg-[#4f7d44]">
                {loading ? "Đang đăng ký..." : "Đăng ký"}
            </Button>

            <BackToLogin />

            <Separator className="my-4" />
        </form>
    );
}
