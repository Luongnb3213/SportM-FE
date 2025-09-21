"use client";

import Image from "next/image";
import { ReactNode } from "react";
import { bigShoulders, openSans } from "@/styles/fonts";

type Props = {
    title: string;
    description?: ReactNode;
    children: ReactNode; // nội dung form bên phải
    imageSrc?: string;   // nếu muốn đổi ảnh
};

export default function AuthShell({
    title,
    description,
    children,
    imageSrc = "/images/login-hero.jpg",
}: Props) {
    return (
        <div className="min-h-svh flex">
            {/* LEFT: 65% image */}
            <div className="hidden md:block basis-[65%] relative">
                <Image src={imageSrc} alt="Sport court" fill priority className="object-cover" />
            </div>

            {/* RIGHT: 35% panel */}
            <div className="flex-1 basis-[35%] relative flex items-stretch p-6 md:p-12">
                <div className={`w-full max-w-[360px] mx-auto flex flex-col h-full ${openSans.className}`}>
                    {/* TOP CONTENT */}
                    <div className="pt-10 md:pt-16 lg:pt-20 xl:pt-24">
                        <h1
                            className={`text-[64px] font-semibold leading-[150%] tracking-[-0.5px] text-[#669250] text-center ${bigShoulders.className}`}
                        >
                            SPORTM
                        </h1>

                        <h2 className="text-[20px] font-bold leading-[28px] text-center">{title}</h2>
                        {description && (
                            <p className="mt-2 text-sm text-center text-muted-foreground">{description}</p>
                        )}

                        <div className="mt-4">{children}</div>
                    </div>

                    {/* BOTTOM FOOTER */}
                    <div className="mt-auto pb-4 flex items-center justify-between text-xs text-muted-foreground">
                        <span className={`${bigShoulders.className} text-lg text-[#4c8c52]`}>SPORTM</span>
                        <span>© {new Date().getFullYear()} SPORTM</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
