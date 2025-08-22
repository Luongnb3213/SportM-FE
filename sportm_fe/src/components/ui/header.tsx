"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { bigShoulders } from "@/styles/fonts";  // import font ở đây

const nav = [
    { href: "/", label: "TRANG CHỦ" },
    { href: "/users", label: "QUẢN LÍ NGƯỜI DÙNG" },
    { href: "/fields", label: "QUẢN LÍ SÂN" },
    { href: "/services", label: "DỊCH VỤ" },
];

export default function Header() {
    const pathname = usePathname();

    return (
        <header className={`w-full ${bigShoulders.className}`}>
            <div className="flex items-center justify-between pt-12 px-12 text-black">
                {/* Logo text */}
                <Link
                    href="/"
                    className="text-[32px] font-semibold leading-[150%] tracking-[-0.5px]"
                >
                    SPORTM
                </Link>

                {/* Center nav (desktop) */}
                <nav className="hidden md:block">
                    <ul className="flex items-center gap-8">
                        {nav.map((item) => {
                            const active =
                                pathname === item.href ||
                                (item.href !== "/" && pathname.startsWith(item.href));
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={[
                                            "text-[20px] font-semibold leading-[150%] tracking-[-0.5px] uppercase",
                                            "hover:opacity-80 transition-opacity",
                                            active ? "underline underline-offset-4" : "opacity-90",
                                        ].join(" ")}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Account (right) */}
                <Link
                    href="/account"
                    className="flex items-center gap-2 text-[20px] font-semibold leading-[150%] tracking-[-0.5px] uppercase hover:opacity-80"
                >
                    <span aria-hidden>👤</span>
                    <span>TÀI KHOẢN</span>
                </Link>
            </div>

            {/* Mobile nav (simple) */}
            <nav className="md:hidden">
                <ul className="flex overflow-x-auto no-scrollbar px-12 pt-4 gap-6 text-white">
                    {nav.map((item) => {
                        const active =
                            pathname === item.href ||
                            (item.href !== "/" && pathname.startsWith(item.href));
                        return (
                            <li key={item.href} className="shrink-0">
                                <Link
                                    href={item.href}
                                    className={[
                                        "text-[16px] font-semibold leading-[150%] tracking-[-0.5px] uppercase",
                                        active ? "underline underline-offset-4" : "opacity-90",
                                    ].join(" ")}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </header>
    );
}
