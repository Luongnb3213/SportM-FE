"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { bigShoulders } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import {
    NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from 'lucide-react';

const REPLIT_URL =
  'https://d074f1d3-6016-4b47-be8c-e09b390896db-00-2sa4l7jmaycln.sisko.replit.dev/';

const nav = [
  { href: '/', label: 'TRANG CHỦ' },
  { href: '/bang-gia', label: 'BẢNG GIÁ' },
  { href: '/about-us', label: 'VỀ CHÚNG TÔI' },
];

export default function Header() {
    const pathname = usePathname();

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

    return (
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-transfor m duration-300 will-change-transform ',
          hidden ? '-translate-y-full' : 'translate-y-0',
          elevated ? 'border-b border-white/10' : '',
          'bg-transparent text-white',
          'leading-[150%] font-semibold',
          bigShoulders.className,
        )}
      >
        <div className="mx-auto w-full px-3 sm:px-4 md:px-8">
          {/* MOBILE: flex row; DESKTOP: grid 3 cột */}
          <div className="flex h-14 items-center justify-between md:grid md:h-auto md:grid-cols-3 md:gap-3 md:py-4 ">
            {/* Logo */}
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
                  {nav.map(item => {
                    const active =
                      pathname === item.href ||
                      (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                      <NavigationMenuItem key={item.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              'uppercase font-semibold whitespace-nowrap',
                              'text-[16px] lg:text-[18px]',
                              'transition-opacity hover:opacity-80 leading-[150%] font-semibold',
                              active ? 'underline underline-offset-4' : 'opacity-90',
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

            {/* Mobile burger */}
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
                    {/* CTA links trong Sheet (mobile) */}
                    <div className="flex gap-4 font-semibold uppercase text-base">
                      <a
                        href={REPLIT_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        Đăng nhập
                      </a>
                      <span className="opacity-50">•</span>
                      <a
                        href={REPLIT_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        Đăng ký
                      </a>
                    </div>

                    {/* Nav list trong Sheet */}
                    <nav className="mt-2">
                      <ul className="flex flex-col">
                        {nav.map(item => {
                          const active =
                            pathname === item.href ||
                            (item.href !== '/' && pathname.startsWith(item.href));
                          return (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                className={cn(
                                  'block py-2 uppercase text-[15px] font-semibold',
                                  active ? 'underline underline-offset-4' : 'opacity-90',
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
