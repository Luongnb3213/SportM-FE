// src/components/home/Hero.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useRef, useState, useEffect } from "react";
import { bigShoulders } from "@/styles/fonts";

const SLIDES = [
    {
        tag: "PHẦN MỀM CHUYÊN BIỆT",
        title:
            "Đặt Lịch Trực Tuyến & Quản Lý Sân Pickleball – Cầu Lông – Tennis – Bóng Đá!",
        cta1: { href: "/dat-lich", label: "Bắt đầu ngay" },
        cta2: { href: "/lien-he", label: "Liên hệ tư vấn" },
    },
    {
        tag: "TỐI ƯU VẬN HÀNH",
        title:
            "Quản lý đặt sân, thanh toán và chăm sóc khách hàng trong một nơi duy nhất.",
        cta1: { href: "/tinh-nang", label: "Xem tính năng" },
        cta2: { href: "/bang-gia", label: "Bảng giá" },
    },
];

export default function Hero() {
    const autoplay = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }));
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, align: "start" },
        [autoplay.current]
    );
    const [selected, setSelected] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!emblaApi) return;
        setCount(emblaApi.slideNodes().length);
        const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
        emblaApi.on("select", onSelect);
        onSelect();
    }, [emblaApi]);

    return (
        // Mobile cao ~80vh; Desktop giữ aspect 16:9
        <section className="relative w-full h-[80vh] md:h-auto md:aspect-[16/9]">
            {/* Background */}
            <Image
                src="/images/bg-homepage.jpg"
                alt="Sân thể thao"
                fill
                priority
                className="object-cover object-center"
                sizes="100vw"
            />

            {/* Overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/70" />

            {/* ===== CONTENT LAYER ===== */}
            <div className="relative z-10 h-full">
                {/* ==== SLIDER (chỉ phần động) ==== */}
                <div
                    className="
            mx-auto max-w-6xl
            px-4 sm:px-6 md:px-12
            h-full flex flex-col
            justify-start md:justify-center
            pt-52 sm:pt-52 md:pt-0
            text-white overflow-hidden
          "
                >
                    <div className="overflow-hidden" ref={emblaRef}>
                        <div className="flex">
                            {SLIDES.map((s, idx) => (
                                <div
                                    key={idx}
                                    className="min-w-0 flex-[0_0_100%] pr-0 md:pr-4 md:pl-12 lg:pl-16"
                                >
                                    {/* Tag */}
                                    <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                                        <span className="h-[2px] w-[40px] md:w-[60px] bg-[#FFEE00]" />
                                        <span
                                            className={`text-[#FFEE00] ${bigShoulders.className} font-bold uppercase tracking-wide text-sm md:text-[20px]`}
                                        >
                                            {s.tag}
                                        </span>
                                    </div>


                                    {/* Title */}
                                    <h1 className="font-[Cambria] text-2xl sm:text-3xl md:text-5xl font-extrabold 
               leading-snug md:leading-[150%] max-w-[90%] md:max-w-3xl ">
                                        {s.title}
                                    </h1>

                                    {/* CTA */}
                                    <div className="mt-6 md:mt-8 flex flex-col md:flex-row gap-3 md:gap-4 ">
                                        {s.cta1 && (
                                            <Link
                                                href={s.cta1.href}
                                                className="inline-block px-6 py-3 bg-[#FFEE00] text-black font-semibold rounded text-center w-full md:w-auto"
                                            >
                                                {s.cta1.label}
                                            </Link>
                                        )}
                                        {s.cta2 && (
                                            <Link
                                                href={s.cta2.href}
                                                className="inline-block px-6 py-3 border border-white/60 font-semibold rounded text-center w-full md:w-auto"
                                            >
                                                {s.cta2.label}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ==== SOCIAL RAIL – CỐ ĐỊNH, KHÔNG DÍNH SLIDER ==== */}
                <div className="hidden md:flex absolute left-6 lg:left-60 top-1/2 -translate-y-1/2 z-20 
                flex-col justify-center items-center gap-3 text-white">
                    <span
                        className={`${bigShoulders.className} [writing-mode:vertical-rl] rotate-360 uppercase tracking-[0.2em] text-[20px] font-semibold text-white drop-shadow`}
                    >
                        THEO DÕI CHÚNG TÔI TẠI
                    </span>
                    <a
                        href="https://instagram.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        className="opacity-80 hover:opacity-100 transition-opacity"
                    >
                        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current drop-shadow">
                            <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 4a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6zM18.5 6.5a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z" />
                        </svg>
                    </a>
                    <a
                        href="https://instagram.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        className="opacity-80 hover:opacity-100 transition-opacity"
                    >
                        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current drop-shadow">
                            <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 4a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6zM18.5 6.5a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z" />
                        </svg>
                    </a>
                </div>

                {/* ==== RIGHT NUMBER RAIL (desktop) ==== */}
                <div className="hidden md:flex absolute right-44 top-1/2 -translate-y-1/2 flex-col items-end z-20">
                    <div className="w-px h-20 bg-white/30 mb-2" />
                    {Array.from({ length: count }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => emblaApi?.scrollTo(i)}
                            className={`pointer-events-auto px-2 my-1 transition-all duration-300 ${i === selected
                                ? "text-[#FFEE00] text-[40px] font-bold leading-none"
                                : "text-white/70 text-[20px]"
                                }`}
                            aria-label={`Chuyển đến slide ${i + 1}`}
                        >
                            {String(i + 1).padStart(2, "0")}
                        </button>
                    ))}
                    <div className="w-px h-20 bg-white/30 mt-2" />
                </div>

                {/* ==== BOTTOM CAPTION (desktop) ==== */}
                <div
                    className={`${bigShoulders.className} absolute bottom-4 inset-x-0 hidden md:grid grid-cols-4 gap-6 text-center text-white/90 text-bg uppercase tracking-wide`}
                >
                    <span>Chuyên biệt cho sân thể thao</span>
                    <span>Tăng tỉ lệ lấp đầy sân trống</span>
                    <span>Dễ sử dụng</span>
                    <span>Hơn 1200+ chủ sân đang dùng</span>
                </div>
            </div>
        </section>
    );
}
