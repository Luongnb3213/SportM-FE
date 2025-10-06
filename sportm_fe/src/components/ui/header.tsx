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
    NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, User, LogOut } from "lucide-react";



export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);

    const [hidden, setHidden] = useState(false);
    const [elevated, setElevated] = useState(false);
    const lastYRef = useRef(0);
    const tickingRef = useRef(false);

    const adminNav = [
        { href: "/", label: "Trang chủ" },
        { href: "/manage/users", label: "Tài khoản" },
        { href: "/manage/ads", label: "Quảng cáo (tất cả)" },
        { href: "/manage/packages", label: "Gói đăng ký" },
    ];

    const ownerNav = [
        { href: "/", label: "Trang chủ" },
        { href: "/manage/fields", label: "Quản lí sân" },
        { href: "/manage/ads", label: "Quảng cáo của tôi" },
        { href: "/manage/reports", label: "Thống kê" },
    ];

    const clientNav = [
        { href: "/", label: "TRANG CHỦ" },
        { href: "/about", label: "VỀ CHÚNG TÔI" },
    ];

    let nav = clientNav;
    if (user?.role === "ADMIN") nav = adminNav;
    if (user?.role === "OWNER") nav = ownerNav;
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
        try { await fetch("/api/auth/logout", { method: "POST" }); } catch { }
        finally {
            dispatch(logoutClient());
            router.push("/login");
        }
    }

    return (
        <header
            className={cn(
                "fixed inset-x-0 top-0 z-50 transition-transfor m duration-300 will-change-transform ",
                hidden ? "-translate-y-full" : "translate-y-0",
                elevated ? "border-b border-white/10" : "",
                // mobile-only: bg trong suốt + chữ trắng
                "bg-transparent text-white",
                "leading-[150%] font-semibold",
                bigShoulders.className
            )}
        >
            <div className="mx-auto w-full px-3 sm:px-4 md:px-8">
                {/* MOBILE: flex row; DESKTOP: grid 3 cột (nguyên bản) */}
                <div className="flex h-14 items-center justify-between md:grid md:h-auto md:grid-cols-3 md:gap-3 md:py-4 ">
                    {/* Logo — mobile nhỏ hơn 1 chút, desktop giữ nguyên (`md:`) */}
                    <Link
                        href="/"
                        className="text-[20px] sm:text-[22px] md:text-[32px] font-semibold tracking-[-0.5px] leading-[150%] "
                        aria-label="SPORTM"
                    >
                        SPORTM
                    </Link>

                    {/* NAV giữa — ẨN mobile, GIỮ desktop */}
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
                                                        "uppercase font-semibold whitespace-nowrap",
                                                        "text-[16px] lg:text-[18px]",
                                                        "transition-opacity hover:opacity-80 leading-[150%] font-semibold",
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

                    {/* Account — ẨN mobile, GIỮ desktop */}
                    <div className="hidden md:flex items-center justify-end gap-4 lg:gap-6">
                        {isAuthenticated && user ? (
                            <>
                                    <User className="h-5 w-5" />
                                    <span className="hidden lg:inline">{user.fullName ?? "TÀI KHOẢN"}</span>
                                    <span className="lg:hidden">TÀI KHOẢN</span>
                                <Button
                                    variant="ghost"
                                    className="uppercase font-semibold hover:underline text-[22px] lg:text-[22px]"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="mr-2 h-5 w-5" />
                                    Đăng xuất
                                </Button>
                            </>
                        ) : (
                            <div className="flex items-center gap-4 lg:gap-6 uppercase font-semibold text-[22px] lg:text-[28px]">
                                <Link href="/login" className="hover:underline">Đăng nhập</Link>
                                <Link href="/register" className="hover:underline">Đăng ký</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile burger — CHỈ mobile */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:bg-white/10"
                                    aria-label="Mở menu"
                                >
                                    <Menu className="h-7 w-7" />
                                </Button>
                            </SheetTrigger>

                            <SheetContent
                                side="right"
                                className="w-[88vw] max-w-[360px] bg-black text-white border-none px-5"
                            >
                                <div className="mt-8 flex flex-col gap-5">
                                    {/* Auth block trong Sheet (mobile) */}
                                    {isAuthenticated && user ? (
                                        <>
                                            <Link
                                                href="/account"
                                                className="flex items-center gap-2 font-semibold uppercase text-base"
                                            >
                                                <User className="h-5 w-5" />
                                                <span className="truncate">{user.fullName ?? "TÀI KHOẢN"}</span>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                className="w-fit uppercase font-semibold hover:underline text-sm"
                                                onClick={handleLogout}
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Đăng xuất
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="flex gap-4 font-semibold uppercase text-base">
                                            <Link href="/login" className="hover:underline">Đăng nhập</Link>
                                            <span className="opacity-50">•</span>
                                            <Link href="/register" className="hover:underline">Đăng ký</Link>
                                        </div>
                                    )}

                                    {/* Nav list trong Sheet */}
                                    <nav className="mt-2">
                                        <ul className="flex flex-col">
                                            {nav.map((item) => {
                                                const active =
                                                    pathname === item.href ||
                                                    (item.href !== "/" && pathname.startsWith(item.href));
                                                return (
                                                    <li key={item.href}>
                                                        <Link
                                                            href={item.href}
                                                            className={cn(
                                                                "block py-2 uppercase text-[15px] font-semibold",
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
            </div>
        </header>
    );
}
