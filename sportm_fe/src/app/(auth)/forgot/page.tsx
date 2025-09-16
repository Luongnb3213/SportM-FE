"use client";

import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function ForgotPage() {
    return (
        <AuthShell
            title="Quên mật khẩu"
            description={
                <>
                    Chúng tôi sẽ gửi mã OTP qua email của bạn. OTP có
                    hiệu lực trong vòng 15 phút.
                </>
            }
        >
            <form className="space-y-4">
                <div className="space-y-1.5">
                    <Label className="pl-4" htmlFor="email">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
                        <Input id="email" type="email" placeholder="Nhập email" className="pl-11 h-10 rounded-full" />
                    </div>
                </div>

                <Button type="submit" className="w-full h-10 rounded-full bg-[#5f8f53] hover:bg-[#4f7d44]">
                    Nhận mã OTP
                </Button>

                <p className="text-center text-sm">
                    Nhớ mật khẩu rồi?{" "}
                    <Link href="/login" className="text-[#4f7d44] hover:underline">Đăng nhập</Link>
                </p>
            </form>
        </AuthShell>
    );
}
