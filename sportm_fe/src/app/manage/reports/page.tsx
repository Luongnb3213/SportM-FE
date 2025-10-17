"use client";

import {
    AlertTriangle,
    BarChart3,
    CheckCircle2,
    Clock3,
    Loader2,
    MapPin,
    TrendingUp,
    Wallet,
    XCircle,
} from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useOwnerDashboard } from "@/hooks/useOwnerDashboard";

function formatCurrency(value: number) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(value);
}

function formatNumber(value: number) {
    return new Intl.NumberFormat("vi-VN").format(value);
}

function parseMonth(month: string) {
    const [yearStr, monthStr] = month.split("-");
    const year = Number(yearStr);
    const monthIndex = Number(monthStr) - 1;
    const valid = Number.isFinite(year) && Number.isFinite(monthIndex) && monthIndex >= 0 && monthIndex < 12;
    return valid ? new Date(year, monthIndex) : null;
}

function formatMonthLabel(month: string) {
    const parsed = parseMonth(month);
    if (!parsed) return month;
    return new Intl.DateTimeFormat("vi-VN", { month: "short", year: "numeric" }).format(parsed);
}

function OverviewSkeleton() {
    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
                <Card key={`skeleton-${idx}`} className="border-dashed">
                    <CardHeader>
                        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
                        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function ChartSkeleton() {
    return (
        <Card className="border-dashed">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="h-5 w-5 animate-pulse text-muted-foreground" />
                    Đang tải biểu đồ...
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mt-6 flex h-56 items-end gap-4">
                    {Array.from({ length: 6 }).map((_, idx) => (
                        <div key={`bar-skeleton-${idx}`} className="flex h-full w-full flex-col items-center gap-3">
                            <div className="h-full w-full animate-pulse rounded bg-muted" />
                            <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default function ManageReportsPage() {
    const { data, loading, error, refetch } = useOwnerDashboard();

    const sortedMonthlyStats = useMemo(() => {
        if (!data) return [];
        return [...data.monthlyBookingStats].sort((a, b) => {
            const aDate = parseMonth(a.month);
            const bDate = parseMonth(b.month);
            if (!aDate || !bDate) return a.month.localeCompare(b.month);
            return aDate.getTime() - bDate.getTime();
        });
    }, [data]);

    const chartMax = useMemo(() => {
        if (!sortedMonthlyStats.length) return 1;
        return Math.max(...sortedMonthlyStats.map((item) => item.count), 1);
    }, [sortedMonthlyStats]);

    const overviewMetrics = useMemo(() => {
        if (!data) {
            return [];
        }

        return [
            {
                key: "totalRevenue",
                label: "Tổng doanh thu",
                value: formatCurrency(data.totalRevenue),
                icon: Wallet,
                accent: "bg-emerald-100 text-emerald-700",
            },
            {
                key: "completedOrders",
                label: "Đơn hàng thành công",
                value: formatNumber(data.completedOrders),
                icon: CheckCircle2,
                accent: "bg-blue-100 text-blue-700",
            },
            {
                key: "cancelledOrders",
                label: "Đơn bị hủy",
                value: formatNumber(data.cancelledOrders),
                icon: XCircle,
                accent: "bg-rose-100 text-rose-700",
            },
            {
                key: "pendingDepositOrders",
                label: "Chờ thanh toán đủ",
                value: formatNumber(data.pendingDepositOrders),
                icon: Clock3,
                accent: "bg-amber-100 text-amber-700",
            },
        ];
    }, [data]);

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Thống kê hoạt động</h1>
                    <p className="text-sm text-muted-foreground">
                        Theo dõi hiệu suất đặt sân và doanh thu của hệ thống sân bóng của bạn.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Làm mới dữ liệu
                </Button>
            </div>

            {error ? (
                <Card className="border-destructive/20 bg-destructive/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Không thể tải thống kê
                        </CardTitle>
                        <CardDescription className="text-destructive/80">{error}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="destructive" onClick={() => refetch()}>
                            Thử lại
                        </Button>
                    </CardContent>
                </Card>
            ) : null}

            {loading && !data ? <OverviewSkeleton /> : null}
            {!loading && data ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {overviewMetrics.map(({ key, label, value, icon: Icon, accent }) => (
                        <Card key={key} className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                                <span className={`flex h-10 w-10 items-center justify-center rounded-full ${accent}`}>
                                    <Icon className="h-5 w-5" />
                                </span>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-semibold">{value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : null}

            {loading && !data ? <ChartSkeleton /> : null}
            {!loading && data ? (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <TrendingUp className="h-5 w-5 text-indigo-500" />
                                Số lượt đặt sân theo tháng
                            </CardTitle>
                            <CardDescription>Thông tin dựa trên dữ liệu đặt sân đã ghi nhận</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {sortedMonthlyStats.length ? (
                            <div className="mt-6 flex h-64 items-end gap-4">
                                {sortedMonthlyStats.map((item) => {
                                    const ratio = item.count / chartMax;
                                    const height = Math.max(ratio * 100, 6);
                                    return (
                                        <div key={item.month} className="flex h-full flex-1 flex-col items-center gap-2">
                                            <div className="flex h-full w-full items-end">
                                                <div
                                                    className="w-full rounded-t-lg bg-indigo-500 transition-[height] duration-500 ease-out"
                                                    style={{ height: `${height}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-slate-700">
                                                {formatNumber(item.count)}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{formatMonthLabel(item.month)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex h-40 flex-col items-center justify-center text-center text-muted-foreground">
                                <BarChart3 className="mb-2 h-6 w-6" />
                                <p>Chưa có dữ liệu đặt sân theo tháng.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : null}

            {!loading && data ? (
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-emerald-200 bg-emerald-50/70">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-emerald-700">
                                <CheckCircle2 className="h-5 w-5" />
                                Sân được đặt nhiều nhất
                            </CardTitle>
                            <CardDescription className="text-emerald-600">
                                Thể hiện nhu cầu cao, hãy đảm bảo lịch đặt luôn cập nhật.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {data.mostBookedCourt ? (
                                <>
                                    <p className="text-lg font-semibold text-emerald-800">{data.mostBookedCourt.name}</p>
                                    <p className="flex items-center gap-2 text-sm text-emerald-700">
                                        <MapPin className="h-4 w-4" />
                                        {formatNumber(data.mostBookedCourt.count)} lượt đặt
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-emerald-700">Chưa có dữ liệu sân nổi bật.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-amber-200 bg-amber-50/70">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-amber-700">
                                <AlertTriangle className="h-5 w-5" />
                                Sân được đặt ít nhất
                            </CardTitle>
                            <CardDescription className="text-amber-600">
                                Cân nhắc chiến dịch khuyến mãi để tăng số lượng đặt sân.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {data.leastBookedCourt ? (
                                <>
                                    <p className="text-lg font-semibold text-amber-800">{data.leastBookedCourt.name}</p>
                                    <p className="flex items-center gap-2 text-sm text-amber-700">
                                        <MapPin className="h-4 w-4" />
                                        {formatNumber(data.leastBookedCourt.count)} lượt đặt
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-amber-700">Chưa có dữ liệu sân kém hiệu quả.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            ) : null}
        </div>
    );
}
