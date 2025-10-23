import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Facebook, Instagram } from "lucide-react";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { bigShoulders } from "@/styles/fonts";

const quickLinks = [
    { href: "/", label: "Trang chủ" },
    { href: "/bang-gia", label: "Bảng giá" },
    { href: "/about-us", label: "Về chúng tôi" },
    { href: "/login", label: "Đăng nhập" },
    { href: "/register", label: "Đăng ký" },
];

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="relative isolate overflow-hidden bg-slate-950 text-slate-100">
            <div
                className="absolute inset-0 opacity-70"
                aria-hidden
                style={{
                    background:
                        "radial-gradient(circle at top left, rgba(59,130,246,0.45), transparent 55%), radial-gradient(circle at bottom right, rgba(14,116,144,0.35), transparent 50%)",
                }}
            />

            <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 py-16 sm:px-8">
                <div className="grid gap-12 md:grid-cols-[1.3fr,1fr,1fr]">
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-6">
                            <Link href="/" className="flex items-center gap-3">
                                <Image
                                    src="/images/sportM.jpg"
                                    alt="SportM logo"
                                    width={72}
                                    height={72}
                                    className="h-12 w-12 rounded-lg object-cover"
                                />
                                <span className={`text-3xl font-semibold uppercase tracking-[0.18em] ${bigShoulders.className}`}>
                                    SportM
                                </span>
                            </Link>
                            <div className="flex gap-2 text-slate-200">
                                {[
                                    {
                                        href: "https://www.facebook.com/sportm9898?mibextid=wwXIfr&rdid=9izKWmzxj1gzlMyv&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F19uNAkfENz%2F%3Fmibextid%3DwwXIfr",
                                        label: "Facebook",
                                        icon: Facebook,
                                    },
                                    {
                                        href: "https://www.tiktok.com/@sportmde?_t=ZS-90arDbTUtD6&_r=1&fbclid=IwY2xjawNdk7lleHRuA2FlbQIxMABicmlkETFydW1qVzZKWVIweEhqYlpXAR70nGTb0JrqWGXMv8UZxM2V_E2tFjoyDDrnxd0KuoDIwCRpTn8ieiV17fBDyg_aem_PgTa7-SofokmEN58vmEb8w",
                                        label: "TikTok",
                                        icon: TikTokIcon,
                                    },
                                    {
                                        href: "https://www.instagram.com/sportm_booking?igsh=MXRvYW0yZzYzNHky&fbclid=IwY2xjawNdk8lleHRuA2FlbQIxMABicmlkETFydW1qVzZKWVIweEhqYlpXAR7KHFjl86WTrQtYbLgioi0WcYHEzt6nqdJ6I8OqzY-lPcgkAA2pxPNx0K1MGg_aem_y2KBlRKCvNVSJbyfM2lf0A",
                                        label: "Instagram",
                                        icon: Instagram,
                                    },
                                ].map(({ href, label, icon: Icon }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        aria-label={label}
                                        className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/10 transition hover:border-white/40 hover:bg-white/20"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <Icon className="size-4" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <p className="text-base leading-7 text-slate-200">
                            SportM kết nối cộng đồng thể thao, giúp chủ sân và người chơi quản lý lịch đặt sân,
                            quảng bá dịch vụ và trải nghiệm thể thao tốt nhất.
                        </p>
                    </div>

                    <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                        <div className="flex flex-col gap-5">
                            <h3 className={`text-xl font-semibold uppercase tracking-wide text-white ${bigShoulders.className}`}>
                                Liên kết nhanh
                            </h3>
                            <nav className="flex flex-wrap gap-x-5 gap-y-2 text-base text-slate-200 uppercase tracking-wide">
                                {quickLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="transition hover:text-white hover:underline hover:underline-offset-4"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        <div className="space-y-4">
                            <h3 className={`text-xl font-semibold uppercase tracking-wide text-white ${bigShoulders.className}`}>
                                Liên hệ
                            </h3>
                            <ul className="space-y-2.5 text-base text-slate-200">
                                <li className="flex gap-2.5">
                                    <Mail className="mt-0.5 size-5 flex-none text-blue-300" />
                                    <a href="mailto:contact@sportm.vn" className="transition hover:text-white">
                                        sportm.team2025@gmail.com
                                    </a>
                                </li>
                                <li className="flex gap-2.5">
                                    <Phone className="mt-0.5 size-5 flex-none text-blue-300" />
                                    <a href="tel:+840123456789" className="transition hover:text-white">
                                        0989898477
                                    </a>
                                </li>
                                <li className="flex gap-2.5">
                                    <MapPin className="mt-0.5 size-5 flex-none text-blue-300" />
                                    <span>Thạch Thất, Hà Nội</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                    <p>© {year} SportM. Giữ mọi quyền được bảo lưu.</p>
                </div>
            </div>
        </footer>
    );
}
