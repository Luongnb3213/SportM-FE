import "@/app/globals.css"; // phải import để Tailwind hoạt động
import { geistSans, geistMono, bigShoulders } from "@/styles/fonts";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <html
            lang="vi"
            className={`${geistSans.variable} ${geistMono.variable} ${bigShoulders.variable}`}
        >
            <body className="min-h-screen font-sans">{children}</body>
        </html>
    );
}
