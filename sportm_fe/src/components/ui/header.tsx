"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { bigShoulders } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, User } from "lucide-react";

const nav = [
    { href: "/", label: "TRANG CHỦ" },
    { href: "/users", label: "QUẢN LÍ NGƯỜI DÙNG" },
    { href: "/fields", label: "QUẢN LÍ SÂN" },
    { href: "/services", label: "DỊCH VỤ" },
];

export default function Header() {
    const pathname = usePathname();

    return (
        <header
            className={cn(
                "fixed inset-x-0 top-0 z-50",
                "bg-transparent text-white",
                bigShoulders.className
            )}
        >
            <div className="flex items-center justify-between px-6 md:px-12 py-4">
                {/* Logo */}
                <Link
                    href="/"
                    className="text-[28px] md:text-[32px] font-semibold tracking-[-0.5px]"
                >
                    SPORTM
                </Link>

                {/* NAV – Desktop */}
                <div className="hidden md:block">
                    <NavigationMenu className="!bg-transparent">
                        <NavigationMenuList className="gap-6">
                            {nav.map((item) => {
                                const active =
                                    pathname === item.href ||
                                    (item.href !== "/" && pathname.startsWith(item.href));
                                return (
                                    <NavigationMenuItem key={item.href}>
                                        <NavigationMenuLink asChild>
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    "uppercase text-[18px] font-semibold",
                                                    "transition-opacity hover:opacity-80",
                                                    active ? "underline underline-offset-4" : "opacity-90"
                                                )}
                                            >
                                                {item.label}
                                            </Link>
                                        </NavigationMenuLink>
                                    </NavigationMenuItem>
                                );
                            })}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                {/* Account + Mobile menu */}
                <div className="flex items-center gap-2">
                    {/* Account desktop */}
                    <Link
                        href="/account"
                        className="hidden md:flex items-center gap-2 uppercase text-[28px] font-semibold hover:opacity-80"
                    >
                        <User className="h-5 w-5" />
                        <span>TÀI KHOẢN</span>
                    </Link>

                    {/* Mobile sheet */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden text-white hover:bg-white/10"
                            >
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="w-[280px] sm:w-[320px] bg-black text-white border-none"
                        >
                            <div className="mt-8 flex flex-col gap-4">
                                <Link href="/account" className="flex items-center gap-2 font-semibold uppercase">
                                    <User className="h-5 w-5" />
                                    TÀI KHOẢN
                                </Link>
                                <nav className="mt-6">
                                    <ul className="flex flex-col gap-3">
                                        {nav.map((item) => {
                                            const active =
                                                pathname === item.href ||
                                                (item.href !== "/" && pathname.startsWith(item.href));
                                            return (
                                                <li key={item.href}>
                                                    <Link
                                                        href={item.href}
                                                        className={cn(
                                                            "uppercase text-[16px] font-semibold",
                                                            active ? "underline underline-offset-4" : "opacity-90"
                                                        )}
                                                    >
                                                        {item.label}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
