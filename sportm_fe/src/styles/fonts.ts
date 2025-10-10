import { Bebas_Neue, Geist, Geist_Mono, Open_Sans } from "next/font/google";

export const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
export const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

// Big Shoulders (SemiBold 600) – xuất *một* instance để dùng cả .className và .variable
export const bigShoulders = Bebas_Neue({
    subsets: ["latin"],
    weight: ["400"],
    variable: "--font-big-shoulders",
});

export const openSans = Open_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-open-sans",
    display: "swap",
});
