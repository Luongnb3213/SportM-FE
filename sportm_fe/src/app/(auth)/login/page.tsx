"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/lib/redux/store";
import { login } from "@/lib/redux/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { bigShoulders, openSans } from "@/styles/fonts";
import { Mail, Lock, LogIn } from "lucide-react";

export default function LoginPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { loading, error } = useSelector((s: RootState) => s.auth);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(true);

    const [localError, setLocalError] = useState<string | null>(null);
    function isValidEmail(value: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!isValidEmail(email)) {
            setLocalError("Email không hợp lệ");
            return;
        }

        setLocalError(null);
        const action = await dispatch(login({ email, password, remember }));
        if (login.fulfilled.match(action)) {
            router.push("/"); // chuyển trang sau login thành công
        }
    }


    return (

        <div className="flex min-h-screen">
            {/* LEFT: 65% image */}
            <div className="relative hidden md:block md:basis-2/3 lg:basis-[65%]">
                <Image
                    src="/images/login-hero.jpg"
                    alt="Sport court"
                    fill
                    priority
                    className="object-cover"
                />
            </div>

            {/* RIGHT: 35% panel */}
            <div className="flex flex-1 basis-full md:basis-1/3 lg:basis-[35%] items-stretch p-6 md:p-12">
                <div className="mx-auto flex h-full w-full max-w-[360px] flex-col">
                    {/* ------- CENTER CONTENT (logo + form) ------- */}
                    <div className="pt-10 md:pt-16 lg:pt-20 xl:pt-24">
                        {/* Logo SPORTM */}
                        <h1
                            className={`text-center text-[48px] md:text-[64px] font-semibold leading-[150%] tracking-[-0.5px] text-[#669250] ${bigShoulders.className}`}
                        >
                            <Link href="/" className="block">
                            SPORTM
                            </Link>
                        </h1>

                        {/* Tiêu đề */}
                        <h2 className={`mb-6 text-center text-[18px] md:text-[20px] font-bold leading-[28px] ${openSans.className}`}>
                            Đăng nhập
                        </h2>

                        {/* Form */}
                        <div className={`${openSans.className}`}>
                            <form className="space-y-4" onSubmit={onSubmit} noValidate>
                                <div className="space-y-1.5">
                                    <Label className="pl-4" htmlFor="email">
                                        Email
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Nhập email"
                                            autoComplete="email"
                                            className="h-10 rounded-full pl-11"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required

                                        />

                                    </div>
                                    {localError && (
                                        <p className="text-xs text-red-600 pl-4">{localError}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="pl-4" htmlFor="password">
                                        Mật khẩu
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Nhập mật khẩu"
                                            autoComplete="current-password"
                                            className="h-10 rounded-full pl-11"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="h-10 w-full rounded-full bg-[#5f8f53] hover:bg-[#4f7d44]"
                                    disabled={loading}
                                >
                                    <LogIn className="mr-2 h-4 w-4" />
                                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                                </Button>

                                {error && (
                                    <p className="text-center text-sm text-red-600">{error}</p>
                                )}

                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center gap-2">
                                        <Checkbox
                                            id="remember"
                                            checked={remember}
                                            onCheckedChange={(v) => setRemember(Boolean(v))}
                                        />{" "}
                                        Ghi nhớ mật khẩu
                                    </label>
                                    <Link href="/forgot" className="text-[#4f7d44] hover:underline">
                                        Quên mật khẩu
                                    </Link>
                                </div>

                                <div className="text-center text-sm">
                                    Bạn chưa có tài khoản?{" "}
                                    <Link href="/register" className="text-[#4f7d44] hover:underline">
                                        Đăng ký
                                    </Link>
                                </div>

                                <Separator className="my-4" />

                                {/* Google button (placeholder) */}
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="h-10 w-full rounded-full bg-neutral-900 text-white hover:bg-neutral-800"
                                    disabled={loading}
                                >
                                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                                        <path
                                            d="M21.35 11.1h-8.9v2.98h5.2c-.23 1.36-1.57 3.98-5.2 3.98-3.13 0-5.68-2.59-5.68-5.8s2.55-5.8 5.68-5.8c1.78 0 2.97.76 3.65 1.41l2.49-2.4C17.46 3.97 15.61 3 13.25 3 8.59 3 4.75 6.86 4.75 11.5S8.59 20 13.25 20c7.95 0 8.1-6.9 7.77-8.9z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    Or sign in with Google
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* ------- STICKY BOTTOM ------- */}
                    <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                        <span className={`${bigShoulders.className} text-lg text-[#4c8c52]`}>
                            SPORTM
                        </span>
                        <span>© {new Date().getFullYear()} SPORTM</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
