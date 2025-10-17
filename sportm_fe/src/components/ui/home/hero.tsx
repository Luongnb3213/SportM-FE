// src/components/home/Hero.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useRef, useState, useEffect } from "react";
import { Facebook, Instagram } from "lucide-react";
import { bigShoulders } from "@/styles/fonts";

const SLIDES = [
    {
        tag: "PHẦN MỀM CHUYÊN BIỆT",
        title:
            "Đặt Lịch Trực Tuyến & Quản Lý Sân Pickleball – Cầu Lông – Tennis – Bóng Đá!",
        cta1: { href: "/login", label: "Bắt đầu ngay" },
        cta2: { href: "/about-us", label: "Liên hệ tư vấn" },
    },
    {
        tag: "TỐI ƯU VẬN HÀNH",
        title:
            "Quản lý đặt sân, thanh toán và chăm sóc khách hàng trong một nơi duy nhất.",
        cta1: { href: "/about-us", label: "Xem tính năng" },
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
                <div
                    className="hidden md:flex absolute left-6 lg:left-60 top-1/2 -translate-y-1/2 z-20 
                flex-col justify-center items-center gap-4 text-white"
                >
                    <span
                        className={`${bigShoulders.className} [writing-mode:vertical-rl] rotate-360 uppercase tracking-[0.2em] text-[20px] font-semibold text-white drop-shadow`}
                    >
                        THEO DÕI CHÚNG TÔI TẠI
                    </span>
                    {[
                        {
                            href: "https://www.facebook.com/sportm9898?mibextid=wwXIfr&rdid=9izKWmzxj1gzlMyv&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F19uNAkfENz%2F%3Fmibextid%3DwwXIfr",
                            label: "Facebook",
                            icon: Facebook,
                        },
                        {
                            href: "https://www.instagram.com/sportm_booking?igsh=MXRvYW0yZzYzNHky&fbclid=IwY2xjawNdk8lleHRuA2FlbQIxMABicmlkETFydW1qVzZKWVIweEhqYlpXAR7KHFjl86WTrQtYbLgioi0WcYHEzt6nqdJ6I8OqzY-lPcgkAA2pxPNx0K1MGg_aem_y2KBlRKCvNVSJbyfM2lf0A",
                            label: "Instagram",
                            icon: Instagram,
                        },
                    ].map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={label}
                            className="transition-opacity hover:opacity-100 opacity-80 text-white"
                        >
                            <Icon className="size-6 drop-shadow" />
                        </Link>
                    ))}
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
                    className={`${bigShoulders.className} absolute bottom-4 inset-x-0 hidden md:flex justify-around text-center text-white/90 uppercase tracking-wide text-[20px]`}
                >
                    <span>Chuyên biệt cho sân thể thao</span>
                    <span>Tăng tỉ lệ lấp đầy sân trống</span>
                    <span>Dễ sử dụng</span>
                    <span>Hiệu quả cao</span>
                    <span>Hơn 1200+ chủ sân đang dùng</span>
                </div>

            </div>
        </section>
    );
}
