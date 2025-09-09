"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { bigShoulders } from "@/styles/fonts";
import { Mail, Lock, LogIn } from "lucide-react";

export default function LoginPage() {
    return (
        <div className="min-h-svh flex">
            {/* LEFT: 65% image */}
            <div className="hidden md:block basis-[65%] relative">
                <Image
                    src="/images/login-hero.jpg"
                    alt="Sport court"
                    fill
                    priority
                    className="object-cover"
                />
            </div>

            {/* RIGHT: 35% panel */}
            <div className="flex-1 basis-[35%] relative flex items-stretch p-6 md:p-12">
                <div className="w-full max-w-[360px] mx-auto flex flex-col h-full">
                    {/* ------- CENTER CONTENT (logo lớn + form) ------- */}
                    <div className="pt-10 md:pt-16 lg:pt-20 xl:pt-24">
                        {/* Logo SPORTM */}
                        <h1
                            className={`text-[64px] font-semibold leading-[150%] tracking-[-0.5px] text-[#669250] text-center ${bigShoulders.className}`}
                        >
                            SPORTM
                        </h1>

                        {/* Tiêu đề */}
                        <h2 className="text-[20px] font-bold leading-[28px] text-center mb-6">
                            Đăng nhập
                        </h2>

                        {/* Form */}
                        <form className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="pl-4" htmlFor="email">
                                    Email
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Nhập email"
                                        className="pl-11 h-10 rounded-full"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="pl-4" htmlFor="password">
                                    Mật khẩu
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Nhập mật khẩu"
                                        className="pl-11 h-10 rounded-full"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-10 rounded-full bg-[#5f8f53] hover:bg-[#4f7d44]"
                            >
                                <LogIn className="mr-2 h-4 w-4" />
                                Đăng nhập
                            </Button>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2">
                                    <Checkbox id="remember" /> Ghi nhớ mật khẩu
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

                            {/* Google button (dark) */}
                            <Button
                                type="button"
                                variant="secondary"
                                className="w-full h-10 rounded-full bg-neutral-900 text-white hover:bg-neutral-800"
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

                    {/* ------- STICKY BOTTOM (logo nhỏ + copyright) ------- */}
                    <div className="mt-auto  flex items-center justify-between text-xs text-muted-foreground">
                        <span className={`${bigShoulders.className} text-lg text-[#4c8c52]`}>SPORTM</span>
                        <span>© {new Date().getFullYear()} SPORTM</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
