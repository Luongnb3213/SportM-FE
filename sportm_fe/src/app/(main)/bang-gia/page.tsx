import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

type Subscription = {
    subscriptionId: string;
    name: string;
    price: number;
    duration: number;
    description: string;
};

const API_ENDPOINT = "https://sportmbe.onrender.com/subcription";

async function fetchSubscriptions(): Promise<Subscription[]> {
    try {
        const res = await fetch(API_ENDPOINT, {
            next: { revalidate: 180 },
            headers: { accept: "*/*" },
        });

        if (!res.ok) {
            console.error("Failed to load subscriptions", res.status);
            return [];
        }

        const json = (await res.json()) as { data?: Subscription[] };
        return json.data ?? [];
    } catch (error) {
        console.error("Error loading subscriptions", error);
        return [];
    }
}

function formatPrice(value: number) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(value);
}

export const metadata = {
    title: "Bảng giá | SportM",
    description: "Các gói dịch vụ SportM dành cho khách hàng.",
};

export default async function PricingPage() {
    const subscriptions = await fetchSubscriptions();

    return (
        <div className="relative isolate overflow-hidden">
            <Image
                src="/images/background-image.png"
                alt="SportM pricing background"
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/65" />

            <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col gap-12 px-4 py-24 text-white sm:px-8 lg:px-12">
                <header className="text-center">
                    <p className="text-sm uppercase tracking-[0.5rem] text-blue-200">SportM Pricing</p>
                    <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                        Chọn gói dịch vụ phù hợp với bạn
                    </h1>
                    <p className="mt-4 text-base text-white/80 sm:text-lg">
                        Các gói đăng ký được cập nhật trực tiếp từ hệ thống của SportM. Hãy chọn gói phù hợp nhất để nhận
                        đầy đủ tính năng và ưu đãi.
                    </p>
                </header>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {subscriptions.length > 0 ? (
                        subscriptions.map((subscription) => (
                            <article
                                key={subscription.subscriptionId}
                                className="group flex flex-col rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur transition hover:border-white/40 hover:bg-white/15"
                            >
                                <h2 className="text-2xl font-bold uppercase tracking-tight">
                                    {subscription.name}
                                </h2>

                                <p className="mt-4 text-sm text-white/75">{subscription.description || "Không có mô tả"}</p>

                                <div className="mt-8">
                                    <p className="text-sm uppercase tracking-widest text-white/70">Giá</p>
                                    <p className="mt-2 text-3xl font-extrabold text-blue-200">{formatPrice(subscription.price)}</p>
                                </div>

                                <div className="mt-auto pt-8">
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <a
                                            href="mailto:contact@sportm.vn"
                                            className="inline-flex items-center justify-center rounded-full bg-blue-500 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-blue-400"
                                        >
                                            Liên hệ tư vấn
                                        </a>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button className="rounded-full bg-white/90 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-blue-950 transition hover:bg-white">
                                                    Mua ngay
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-md border border-white/15 bg-slate-950/95 text-white">
                                                <DialogHeader>
                                                    <DialogTitle className="text-xl font-bold uppercase">
                                                        {subscription.name}
                                                    </DialogTitle>
                                                    <DialogDescription className="text-white/70">
                                                        Quét mã QR để hoàn tất thanh toán gói {formatPrice(subscription.price)}.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="relative mx-auto mt-4 w-full max-w-xs overflow-hidden rounded-2xl">
                                                    <Image
                                                        src="/images/QR_code.png"
                                                        alt="Mã QR thanh toán SportM"
                                                        width={400}
                                                        height={400}
                                                        className="h-full w-full object-cover"
                                                        priority={false}
                                                    />
                                                </div>
                                                <p className="mt-6 rounded-md bg-yellow-500/10 p-4 text-center text-sm font-semibold uppercase tracking-wide text-yellow-200">
                                                    Cú pháp: Tên tài khoản - Gói Sản Phầm - Tên Người Gửi
                                                </p>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="col-span-full rounded-2xl border border-white/20 bg-white/10 p-10 text-center text-white/80">
                            Hiện tại chưa có gói đăng ký nào khả dụng. Vui lòng quay lại sau hoặc liên hệ với SportM để
                            được hỗ trợ.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
