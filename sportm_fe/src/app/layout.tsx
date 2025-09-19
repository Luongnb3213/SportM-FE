import "./globals.css";
import { cookies } from "next/headers";
import ReduxProvider from "@/lib/redux/provider";
import { geistSans, geistMono, bigShoulders, openSans } from "@/styles/fonts";
import ClientHydrator from "@/components/ClientHydrator";
import type { User } from "@/lib/redux/features/auth/types";
import { Toaster } from "sonner";
export const metadata = { title: "SportM", description: "SportM Application" };

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
                <ReduxProvider>
                    <ClientHydrator user={user} />
                    {children}
                    <Toaster richColors position="top-right" />
                </ReduxProvider>
            </body>
        </html>
    );
}
