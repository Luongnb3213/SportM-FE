import "./globals.css";
import type { Metadata } from "next";
import { geistSans, geistMono, bigShoulders, openSans } from "@/styles/fonts";
import { Toaster } from "sonner";


export const metadata: Metadata = {
    title: "SportM",
    description: "SportM Application",
    icons: {
        icon: "/images/sportM.jpg",
        shortcut: "/images/sportM.jpg",
        apple: "/images/sportM.jpg",
    },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html
            lang="vi"
            className={`${geistSans.variable} ${geistMono.variable} ${bigShoulders.variable} ${openSans.variable}`}
        >
            <body className={`min-h-screen ${bigShoulders.className}`}>
                {children}
                <Toaster richColors position="top-right" />
            </body>
        </html>
    );
}
