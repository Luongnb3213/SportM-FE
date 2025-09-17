"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

type Props = {
    index: number;
    label?: string;
    title: string | React.ReactNode;
    description: string;
    image: { src: string; alt: string };
    cta?: { label?: string; href: string };
    reverse?: boolean;
    bg?: string;
    className?: string;
};

export default function FeatureSection({
    index,
    label = "PHẦN MỀM CHUYÊN BIỆT",
    title,
    description,
    image,
    cta = { label: "xem thêm", href: "#" },
    reverse = false,
    bg = "/images/feature-bg.png",
    className,
}: Props) {
    return (
        <section
            className={cn(
                "relative isolate overflow-hidden text-white",
                "flex items-center justify-center",
                "min-h-[724px] py-12 md:py-20",
                className
            )}
            style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="mx-auto w-full max-w-[1180px] px-4 md:px-6">
                <div
                    className={cn(
                        // layout md+: flex 2 khối, đảo hướng khi reverse
                        "md:flex md:items-center md:gap-16 lg:gap-20",
                        reverse ? "md:flex-row-reverse" : "md:flex-row"
                    )}
                >
                    {/* TEXT BLOCK */}
                    <div className="md:flex-1 md:max-w-[620px] lg:max-w-[700px] md:px-2">
                        <div className="mb-6 flex items-center gap-4">
                            {/* thanh vàng dài hơn  */}
                            <span className="h-[3px] w-28 md:w-36 bg-[#FFD400]" />
                            <span className="text-[#FFD400] text-base md:text-lg lg:text-[20px] leading-[150%] font-bold uppercase tracking-tight">
                                {label}
                            </span>
                        </div>

                        {/* Tiêu đề riêng hàng */}


                        {/* Hàng nội dung gồm số + đoạn mô tả */}
                        <div className="grid grid-cols-[auto_1fr] gap-6 md:gap-8 items-center">

                            {/* SỐ THỨ TỰ – căn giữa theo CHIỀU DỌC */}
                            <div className="row-span-2 flex items-center">
                                <div className="text-[#FFD400] text-[64px] md:text-[88px] font-extrabold leading-[0.9]">
                                    {String(index).padStart(2, "0")}
                                </div>
                            </div>
                            <h2 className="mb-6 text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
                                {title}
                            </h2>
                            {/* MÔ TẢ – hỗ trợ xuống dòng bằng \n */}
                            <div>
                                <p className="mb-1 max-w-[560px] text-[20px] md:text-[22px] leading-8 text-gray-200 whitespace-pre-line">
                                    {description}
                                </p>

                                <Link
                                    href={cta.href}
                                    className="group inline-flex items-center gap-1 text-[#FFD400] font-semibold hover:underline"
                                >
                                    {cta.label}
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>                    </div>
                    </div>

                    {/* IMAGE BLOCK – cố định width, không co lại */}
                    <div className="relative mx-auto mt-10 md:mt-0 w-[320px] sm:w-[360px] md:w-[420px] lg:w-[460px] aspect-[2/3] shrink-0">
                        <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            className="object-cover rounded-lg shadow-lg"
                            sizes="(min-width: 1024px) 460px, (min-width: 768px) 420px, 360px"
                            priority={index === 1}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
