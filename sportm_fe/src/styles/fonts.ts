import { Big_Shoulders, Geist, Geist_Mono, Open_Sans } from "next/font/google";

export const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
export const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

// Big Shoulders – font tiêu đề chính
export const bigShoulders = Big_Shoulders({
    subsets: ["latin", "vietnamese"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-big-shoulders",
    display: "swap",
});

export const openSans = Open_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-open-sans",
    display: "swap",
});
