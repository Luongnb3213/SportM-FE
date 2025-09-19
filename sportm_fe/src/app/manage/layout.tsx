// app/manage/layout.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/redux/features/auth/types";

async function getUserFromCookie(): Promise<User | null> {
    const store = await cookies();
    const raw = store.get("user")?.value;
    try { return raw ? (JSON.parse(decodeURIComponent(raw)) as User) : null; }
    catch { return null; }
}

export default async function ManageLayout({ children }: { children: React.ReactNode }) {
    const user = await getUserFromCookie();
    if (!user) redirect("/login");
    if (user.role === "CLIENT") redirect("/"); // ✅ chặn client

    const adminNav = [
        { href: "/", label: "Trang chủ" },
        { href: "/manage/users", label: "Tài khoản" },
        { href: "/manage/ads", label: "Quảng cáo (tất cả)" },
        { href: "/manage/packages", label: "Gói đăng ký" },
        { href: "/manage/field-types", label: "Loại sân" },
    ];
    const ownerNav = [
        { href: "/manage", label: "Trang chủ" },
        { href: "/manage/fields", label: "Quản lí sân" },
        { href: "/manage/ads", label: "Quảng cáo của tôi" },
        { href: "/manage/reports", label: "Thống kê" },
    ];
    const nav = user.role === "ADMIN" ? adminNav : ownerNav;

    return (
        <div className="flex min-h-screen">
            <aside className="w-64 bg-[#1A2440] text-white p-4">
                <Link href="/login" className="block text-2xl font-semibold mb-8">SPORTM</Link>
                <nav className="space-y-2">
                    {nav.map(i => (
                        <Link key={i.href} href={i.href} className={cn("block px-3 py-2 rounded-md hover:bg-white/10")}>
                            {i.label}
                        </Link>
                    ))}
                </nav>
            </aside>
            <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">{children}</main>
        </div>
    );
}
