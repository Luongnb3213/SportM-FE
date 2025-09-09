"use client";

import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import OtpInput from "@/components/auth/OtpInput";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function VerifyEmailPage() {
    // (tuỳ bạn lấy email từ query/session)
    const maskedEmail = "mother*****@gmail.com";
    const [code, setCode] = useState("");

    return (
        <AuthShell
            title="Nhập mã OTP"
            description={
                <>
                    Nhập mã OTP đã gửi qua <span className="font-semibold">{maskedEmail}</span>
                </>
            }
        >
            <div className="space-y-4">
                {/* OTP boxes */}
                <OtpInput length={6} onChange={setCode} />

                {/* Resend */}
                <div className="text-center text-sm">
                    Bạn chưa nhận được mã OTP?{" "}
                    <button type="button" className="text-[#4f7d44] hover:underline">
                        Gửi lại mã OTP
                    </button>
                </div>

                {/* Submit */}
                <Button
                    disabled={code.length !== 6}
                    className="w-full h-10 rounded-full bg-[#5f8f53] hover:bg-[#4f7d44] disabled:opacity-60"
                >
                    Xác nhận
                </Button>

                {/* Back to login/register if cần */}
                <p className="text-center text-sm">
                    Quay lại{" "}
                    <Link href="/login" className="text-[#4f7d44] hover:underline">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </AuthShell>
    );
}
