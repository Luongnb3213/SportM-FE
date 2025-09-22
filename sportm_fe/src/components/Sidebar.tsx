// app/manage/_components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

// 👇 import type LucideIcon
import {
    Home,
    Users,
    Megaphone,
    Package,
    Dumbbell,
    LayoutGrid,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    type LucideIcon,   // ✅ add this
} from "lucide-react";

type IconName =
    | "Home"
    | "Users"
    | "Megaphone"
    | "Package"
    | "Dumbbell"
    | "LayoutGrid"
    | "BarChart3";

// 👇 Dùng LucideIcon thay vì tự định nghĩa IconType
const ICONS: Record<IconName, LucideIcon> = {
    Home,
    Users,
    Megaphone,
    Package,
    Dumbbell,
    LayoutGrid,
    BarChart3,
};

type NavItem = { href: string; label: string; icon: IconName };

export default function Sidebar({
    nav,
    brand,
    bigShouldersClass,
}: {
    nav: readonly NavItem[];
    brand: { name: string };
    bigShouldersClass?: string;
}) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                "relative bg-[#1A2440] text-white p-4 transition-all duration-200 ease-in-out",
                collapsed ? "w-20" : "w-64"
            )}
        >
            {/* Brand + toggle */}
            <div className="flex items-center justify-between mb-6">
                <Link
                    href="/"
                    className={cn(
                        "block text-2xl font-semibold whitespace-nowrap",
                        bigShouldersClass,
                        collapsed && "opacity-0 pointer-events-none select-none"
                    )}
                    aria-hidden={collapsed ? "true" : "false"}
                >
                    {brand.name}
                </Link>

                <button
                    type="button"
                    onClick={() => setCollapsed((v) => !v)}
                    className={cn(
                        "absolute -right-3 top-4 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#1A2440] shadow-md ring-1 ring-black/10",
                        "hover:scale-105 transition"
                    )}
                    aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
                    title={collapsed ? "Mở rộng" : "Thu gọn"}
                >
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
            </div>

            {/* Nav */}
            <nav className="space-y-1">
                {nav.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        (item.href !== "/manage" && pathname.startsWith(item.href));
                    const Icon = ICONS[item.icon];

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                                "hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                                isActive ? "bg-white/15" : "bg-transparent",
                                collapsed && "justify-center"
                            )}
                            aria-label={item.label}
                            title={collapsed ? item.label : undefined}
                        >
                            <Icon className="h-5 w-5 shrink-0" />
                            {!collapsed && <span className="truncate">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
