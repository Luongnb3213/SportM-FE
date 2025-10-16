"use client";

import { PartyPopper, Smile } from "lucide-react";
import { useEffect } from "react";

export default function ManageHome() {
    useEffect(() => {
        // 👇 confetti effect chỉ chạy 1 lần khi load
        import("canvas-confetti").then((confetti) => {
            confetti.default({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
            });
        });
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8 relative overflow-hidden">
            {/* background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-pink-50" />

            {/* Card trung tâm */}
            <div className="relative z-10 bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl px-10 py-12 max-w-2xl mx-auto">
                <h1 className="text-4xl font-extrabold text-[#1A2440] flex items-center justify-center gap-3 mb-6">
                    <PartyPopper className="h-8 w-8 text-pink-500 animate-bounce" />
                    Dashboard quản lý
                    <PartyPopper className="h-8 w-8 text-yellow-400 animate-bounce delay-200" />
                </h1>

                <p className="text-lg text-gray-700 flex items-center justify-center gap-2 mb-2">
                    <Smile className="h-5 w-5 text-green-500" />
                    Chào mừng bạn quay lại! ✨
                </p>
                <p className="text-base text-gray-500 mb-6">
                    Đây là không gian quyền lực của bạn. Quản lý, kiểm soát và phát triển mọi thứ theo cách thật thông minh nhé 🚀
                </p>
            </div>

            {/* Glow effect */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl animate-pulse" />
        </div>
    );
}
