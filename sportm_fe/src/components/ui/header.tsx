"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import type { RootState } from "@/lib/redux/store";
import { logoutClient } from "@/lib/redux/features/auth/authSlice";
import { bigShoulders } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, User, LogOut } from "lucide-react";

const nav = [
    { href: "/", label: "TRANG CHỦ" },
    { href: "/users", label: "QUẢN LÍ NGƯỜI DÙNG" },
    { href: "/fields", label: "QUẢN LÍ SÂN" },
    { href: "/services", label: "DỊCH VỤ" },
];

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);

    // Hide on scroll down / show on scroll up
    const [hidden, setHidden] = useState(false);
    const [elevated, setElevated] = useState(false);
    const lastYRef = useRef(0);
    const tickingRef = useRef(false);

    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY || 0;
            if (!tickingRef.current) {
                window.requestAnimationFrame(() => {
                    const last = lastYRef.current;
                    const delta = y - last;
                    if (delta > 6 && y > 72) setHidden(true);
                    else if (delta < -6) setHidden(false);
                    setElevated(y > 10);
                    lastYRef.current = y;
                    tickingRef.current = false;
                });
                tickingRef.current = true;
            }
        };
        lastYRef.current = window.scrollY || 0;
        setElevated(lastYRef.current > 10);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    async function handleLogout() {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch {
            // ignore
        } finally {
            dispatch(logoutClient());
            router.push("/login");
        }
    }

    return (
        <header
            className={cn(
                "fixed inset-x-0 top-0 z-50 transition-transform duration-300 will-change-transform",
                hidden ? "-translate-y-full" : "translate-y-0",
                elevated ? "bg-transparent border-b border-white/10" : "bg-transparent",
                "text-white",
                bigShoulders.className
            )}
        >
            {/* container */}
            <div className="mx-auto w-full px-4 sm:px-6 md:px-8">
                {/* Grid 3 cột: trái | giữa | phải */}
                <div className="grid grid-cols-3 items-center gap-3 py-3 md:py-4">
                    {/* Logo (trái) */}
                    <div className="justify-self-start">
                        <Link
                            href="/"
                            className="text-[24px] sm:text-[26px] md:text-[32px] font-semibold tracking-[-0.5px]"
                        >
                            SPORTM
                        </Link>
                    </div>

                    {/* NAV – giữa (ẩn mobile) */}
                    <div className="hidden md:flex justify-center">
                        <NavigationMenu className="!bg-transparent">
                            <NavigationMenuList className="gap-6 lg:gap-10">
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
                                                        "uppercase font-semibold",
                                                        "text-[16px] lg:text-[18px]",
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

                    {/* Account / Auth + Mobile trigger (phải) */}
                    <div className="flex items-center gap-2 justify-self-end">
                        {/* Desktop */}
                        {isAuthenticated && user ? (
                            <div className="hidden md:flex items-center gap-4 lg:gap-6">
                                <Link
                                    href="/account"
                                    className="flex items-center gap-2 uppercase font-semibold hover:opacity-80 text-[22px] lg:text-[28px]"
                                >
                                    <User className="h-5 w-5" />
                                    <span className="hidden lg:inline">{user.fullName ?? "TÀI KHOẢN"}</span>
                                    <span className="lg:hidden">TÀI KHOẢN</span>
                                </Link>
                                <Button
                                    variant="ghost"
                                    className="uppercase font-semibold hover:underline text-[22px] lg:text-[28px]"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="mr-2 h-5 w-5" />
                                    Đăng xuất
                                </Button>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-4 lg:gap-6 uppercase font-semibold text-[22px] lg:text-[28px]">
                                <Link href="/login" className="hover:underline">
                                    Đăng nhập
                                </Link>
                                <Link href="/register" className="hover:underline">
                                    Đăng ký
                                </Link>
                            </div>
                        )}

                        {/* Mobile trigger */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden text-white hover:bg-white/10"
                                    aria-label="Open menu"
                                >
                                    <Menu className="h-7 w-7" />
                                </Button>
                            </SheetTrigger>

                            {/* Mobile sheet */}
                            <SheetContent
                                side="right"
                                className="w-[280px] sm:w-[320px] bg-black text-white border-none"
                            >
                                <div className="mt-8 flex flex-col gap-5">
                                    {isAuthenticated && user ? (
                                        <>
                                            <Link
                                                href="/account"
                                                className="flex items-center gap-2 font-semibold uppercase text-lg"
                                            >
                                                <User className="h-5 w-5" />
                                                {user.fullName ?? "TÀI KHOẢN"}
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                className="w-fit uppercase font-semibold hover:underline"
                                                onClick={handleLogout}
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Đăng xuất
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="flex gap-4 font-semibold uppercase text-lg">
                                            <Link href="/login" className="hover:underline">
                                                Đăng nhập
                                            </Link>
                                            <Link href="/register" className="hover:underline">
                                                Đăng ký
                                            </Link>
                                        </div>
                                    )}

                                    <nav className="mt-2">
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
                                                                "uppercase text-base font-semibold",
                                                                active
                                                                    ? "underline underline-offset-4"
                                                                    : "opacity-90"
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
            </div>
        </header>
    );
}
