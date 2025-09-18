"use client";

import AuthShell from "@/components/auth/AuthShell";
import EmailOtpForm from "@/components/auth/EmailOtpForm";

export default function ForgotPage() {
    return (
        <AuthShell
            title="Quên mật khẩu"
            description={<>Chúng tôi sẽ gửi mã OTP qua email của bạn. OTP có hiệu lực trong 15 phút.</>}
        >
            <EmailOtpForm nextHref="/verify-email?mode=forgot" />
        </AuthShell>
    );
}
