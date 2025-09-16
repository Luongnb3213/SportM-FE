// src/components/ui/home/feature-section.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { bigShoulders } from "@/styles/fonts";
import { cn } from "@/lib/utils";

type Props = {
    index: string;                // "01"..."04"
    eyebrow: string;              // PHẦN MỀM CHUYÊN BIỆT
    title: string;
    bullets: string[];
    ctaLabel?: string;
    href?: string;
    imageSrc: string;
    imageLeft?: boolean;
};

export default function FeatureSection({
    index,
    eyebrow,
    title,
    bullets,
    ctaLabel = "xem thêm",
    href = "#",
    imageSrc,
    imageLeft = false,
}: Props) {
    return (
        <section className="relative py-20 md:py-28">
            <div className="absolute inset-0 bg-[#0f1f27]/50 -z-10" />

            <div className="container mx-auto px-6 md:px-10">
                <div
                    className={cn(
                        "grid items-center gap-10 md:gap-16",
                        "md:grid-cols-2"
                    )}
                >
                    {/* Text */}
                    <div className={cn(imageLeft && "md:order-2")}>
                        <div className="flex items-center gap-4">
                            <span className="h-[2px] w-16 bg-yellow-400" />
                            <span className="text-yellow-400 text-sm font-semibold uppercase tracking-wider">
                                {eyebrow}
                            </span>
                        </div>

                        <div className="mt-4 flex items-start gap-6">
                            <span
                                className={cn(
                                    "text-6xl md:text-7xl text-yellow-400 leading-none",
                                    bigShoulders.className
                                )}
                            >
                                {index}
                            </span>

                            <div>
                                <h3 className="text-white text-3xl md:text-4xl font-bold leading-tight">
                                    {title}
                                </h3>
                                <div className="mt-3 space-y-2 text-white/80">
                                    {bullets.map((b, i) => (
                                        <p key={i}>{b}</p>
                                    ))}
                                </div>

                                <Link
                                    href={href}
                                    className="mt-3 inline-flex items-center gap-2 text-yellow-300 hover:text-yellow-200"
                                >
                                    {ctaLabel} <span aria-hidden>→</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Image */}
                    <div className={cn("md:justify-self-end", imageLeft && "md:order-1 md:justify-self-start")}>
                        <div className="relative w-full max-w-[420px] aspect-[3/4] rounded-md overflow-hidden shadow-2xl">
                            <Image
                                src={imageSrc}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="(min-width: 768px) 420px, 80vw"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
