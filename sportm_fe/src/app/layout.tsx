import "./globals.css";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import ReduxProvider from "@/lib/redux/provider";
import { geistSans, geistMono, bigShoulders, openSans } from "@/styles/fonts";
import ClientHydrator from "@/components/ClientHydrator";
import type { User } from "@/lib/redux/features/auth/types";
import { Toaster } from "sonner";
import AuthSessionProvider from "@/components/auth/SessionProvider";
export const metadata: Metadata = {
    title: "SportM",
    description: "SportM Application",
    icons: {
        icon: "/images/sportM.jpg",
        shortcut: "/images/sportM.jpg",
        apple: "/images/sportM.jpg",
    },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const store = await cookies();
    const raw = store.get("user")?.value;
    let user: User | null = null;
    try {
        user = raw ? (JSON.parse(decodeURIComponent(raw)) as User) : null;
    } catch { }

    return (
        <html
            lang="vi"
            className={`${geistSans.variable} ${geistMono.variable} ${bigShoulders.variable} ${openSans.variable}`}
        >
            <body className={`min-h-screen ${bigShoulders.className}`}>
                <AuthSessionProvider>
                    <ReduxProvider>
                        <ClientHydrator user={user} />
                        {children}
                        <Toaster richColors position="top-right" />
                    </ReduxProvider>
                </AuthSessionProvider>
            </body>
        </html>
    );
}
