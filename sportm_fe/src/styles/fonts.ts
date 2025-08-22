import { Big_Shoulders, Geist, Geist_Mono } from "next/font/google";

export const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
export const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

// Big Shoulders (SemiBold 600) – xuất *một* instance để dùng cả .className và .variable
export const bigShoulders = Big_Shoulders({
    subsets: ["latin", "vietnamese"],
    weight: ["600"],
    variable: "--font-big-shoulders",
});
