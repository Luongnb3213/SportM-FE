// app/manage/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/redux/features/auth/types";
import { openSans, bigShoulders } from "@/styles/fonts";
import Sidebar from "../../components/Sidebar"; 

async function getUserFromCookie(): Promise<User | null> {
    const store = await cookies();
    const raw = store.get("user")?.value;
    try { return raw ? (JSON.parse(decodeURIComponent(raw)) as User) : null; }
    catch { return null; }
}

export default async function ManageLayout({ children }: { children: React.ReactNode }) {
    const user = await getUserFromCookie();
    if (!user) redirect("/login");
    if (user.role === "CLIENT") redirect("/");

    // 👇 thêm icon vào từng item (định nghĩa ở client component)
    const adminNav = [
        { href: "/manage", label: "Trang chủ", icon: "Home" },
        { href: "/manage/users", label: "Tài khoản", icon: "Users" },
        { href: "/manage/ads", label: "Quảng cáo (tất cả)", icon: "Megaphone" },
        { href: "/manage/packages", label: "Gói đăng ký", icon: "Package" },
        { href: "/manage/sport-type", label: "Loại sân", icon: "Dumbbell" },
    ] as const;

    const ownerNav = [
        { href: "/manage", label: "Trang chủ", icon: "Home" },
        { href: "/manage/fields", label: "Quản lí sân", icon: "LayoutGrid" },
        { href: "/manage/ads", label: "Quảng cáo của tôi", icon: "Megaphone" },
        { href: "/manage/reports", label: "Thống kê", icon: "BarChart3" },
    ] as const;

    const nav = user.role === "ADMIN" ? adminNav : ownerNav;

    return (
        <div className="flex min-h-screen">
            {/* 👇 Sidebar có thể thu gọn/phóng to */}
            <Sidebar
                nav={nav}
                brand={{ name: "SPORTM" }}
                bigShouldersClass={bigShoulders.className}
            />

            {/* 👇 Force Open Sans cho khu vực quản trị */}
            <main className={cn("flex-1 bg-gray-50 p-6 overflow-y-auto", openSans.className)}>
                {children}
            </main>
        </div>
    );
}
