"use client";

import AuthShell from "@/components/auth/AuthShell";
import VerifyOtpBlock from "@/components/auth/VerifyOtpBlock";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
    const sp = useSearchParams();
    const mode = sp.get("mode") || "register";

    // sau verify xong:
    const nextHref = mode === "forgot" ? "/auth/reset-password" : "/register?step=form";

    return (
        <AuthShell title="Nhập mã OTP">
            <VerifyOtpBlock nextHref={nextHref} />
        </AuthShell>
    );
}
