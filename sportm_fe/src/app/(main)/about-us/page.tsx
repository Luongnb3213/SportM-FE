"use client";

import Image from "next/image";
import { bigShoulders, openSans } from "@/styles/fonts"; // 👈 thêm openSans
import { cn } from "@/lib/utils";

export default function AboutPage() {
    return (
        <main className={cn("relative min-h-screen text-white overflow-hidden", openSans.className)}>
            {/* BG */}
            <div className="absolute inset-0 -z-10">
                <Image
                    src="/images/background-image.png"
                    alt="Background"
                    fill
                    priority
                    className="object-cover object-center"
                />
            </div>

            {/* tránh bị header che */}
            <div className="h-16 md:h-20" />

            {/* 1️⃣ Giới thiệu */}
            <section className="mx-auto max-w-6xl px-4 md:px-6 py-10 md:py-14">
                <h1
                    className={cn(
                        "mx-auto w-full border-white/20 px-6 py-4 text-center",
                        bigShoulders.className, // tiêu đề chính giữ font mạnh
                        "text-[28px] leading-none md:text-[40px] lg:text-[40px] tracking-tight"
                    )}
                >
                    Giới Thiệu Về Chúng Tôi
                </h1>

                <p className="mt-8 rounded-xl border border-white/20 bg-white/5 px-6 py-5 text-[15px] md:text-[20px] leading-7">
                    “SPORTM là nền tảng kết nối người yêu thể thao với hàng trăm sân bóng, cầu lông, tennis,
                    bơi lội tại Việt Nam. Chúng tôi giúp bạn tiết kiệm thời gian đặt sân, minh bạch giá cả và
                    tận hưởng trận đấu trọn vẹn.”
                </p>
            </section>

            {/* 2️⃣ Sứ mệnh */}
            <section className="relative mx-auto max-w-[1400px] px-6 md:px-12 py-10 md:py-16">
                <h2
                    className={cn(
                        "relative z-10 text-center",
                        bigShoulders.className,
                        "text-[28px] md:text-[40px] lg:text-[48px] tracking-tight"
                    )}
                >
                    Sứ Mệnh Của Chúng Tôi
                </h2>

                {/* Hàng trên: 01 và 02 */}
                <div className="relative z-10 mt-12 grid md:grid-cols-2 gap-x-32 justify-items-center">
                    <MissionCard
                        index="01"
                        text={
                            <>
                                Giúp mọi người dễ dàng tiếp cận <br />
                                sân thể thao chất lượng
                            </>
                        }
                    />
                    <MissionCard
                        index="02"
                        text={
                            <>
                                Trở thành nền tảng đặt sân <br />
                                hàng đầu Đông Nam Á
                            </>
                        }
                    />
                </div>

                {/* Hàng dưới: ảnh + 03 */}
                <div className="relative z-10 mt-14 grid md:grid-cols-2 gap-x-24 items-center justify-items-center">
                    <figure className="overflow-hidden  border-white/10 shadow-lg">
                        <Image
                            src="/images/image.png"
                            alt="Sân tennis"
                            width={1200}
                            height={800}
                            className="h-[260px] w-full object-cover md:h-[360px]"
                            priority
                        />
                    </figure>

                    <MissionCard
                        index="03"
                        text={
                            <>
                                Minh bạch – Tiện lợi – <br />
                                Cộng đồng – Năng động.
                            </>
                        }
                    />
                </div>
            </section>

            {/* 3️⃣ Thành tựu */}
            <section className="bg-[#1E4A5A]/80 backdrop-blur-md">
                <div className="mx-auto max-w-6xl px-4 md:px-6 py-10 md:py-14">
                    <h3
                        className={cn(
                            "text-center",
                            bigShoulders.className,
                            "text-[26px] md:text-[36px] lg:text-[44px] tracking-tight"
                        )}
                    >
                        Chúng Tôi Đã Đạt Được
                    </h3>

                    <div className="mt-8 grid gap-10 text-center sm:grid-cols-3">
                        <Stat number="50 +" label="sân thể thao liên kết" />
                        <Stat number="10.000 +" label="lượt đặt sân thành công" />
                        <Stat number="4.8/5" label="điểm hài lòng từ khách hàng" />
                    </div>
                </div>
            </section>

            <div className="pb-16" />
        </main>
    );
}

/* 🔸 MissionCard */
function MissionCard({
    index,
    text,
    size = "md",
}: {
    index: string;
    text: string | React.ReactNode;
    size?: "md" | "lg";
}) {
    return (
        <div className={cn("w-full flex flex-col items-center", openSans.className)}>
            <div
                className={cn(
                    bigShoulders.className, // số giữ font đặc trưng
                    "font-black leading-none text-[#FFEA00]",
                    size === "lg"
                        ? "text-[84px] md:text-[112px]"
                        : "text-[72px] md:text-[92px]"
                )}
            >
                {index}
            </div>

            <div className="mt-4 w-full max-w-[460px]">
                <p className="text-center text-[15px] md:text-[18px] leading-7">{text}</p>
            </div>
        </div>
    );
}

/* 🔸 Stat */
function Stat({ number, label }: { number: string; label: string }) {
    return (
        <div className={cn("rounded-2xl border border-white/10 bg-white/5 px-6 py-8", openSans.className)}>
            <div
                className={cn(
                    bigShoulders.className,
                    "text-[34px] md:text-[40px] font-extrabold leading-none text-[#E6FF37]"
                )}
            >
                {number}
            </div>
            <div className="mt-2 text-[14px] md:text-[15px] opacity-90">{label}</div>
        </div>
    );
}
