"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/lib/redux/store";
import type { RootState } from "@/lib/redux/store";
import {
    fetchSubscriptions,
    createSubscription,
    updateSubscription,
    clearSubscriptionsError,
} from "@/lib/redux/features/manage/packages/packagesSlice";
import type { CreateSubscriptionBody, Subscription } from "@/lib/redux/features/manage/packages/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { bigShoulders, openSans } from "@/styles/fonts";

const EMPTY_FORM: CreateSubscriptionBody = {
    name: "",
    price: 0,
    duration: 0,
    description: "",
};

export default function ManagePackagesPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { items, loading, saving, error } = useSelector((state: RootState) => state.subscriptions);

    const [openDialog, setOpenDialog] = useState(false);
    const [editing, setEditing] = useState<Subscription | null>(null);
    const [form, setForm] = useState<CreateSubscriptionBody>(EMPTY_FORM);

    useEffect(() => {
        dispatch(fetchSubscriptions());
    }, [dispatch]);

    useEffect(() => {
        if (error) toast.error(error);
    }, [error]);

    function openCreate() {
        setEditing(null);
        setForm(EMPTY_FORM);
        setOpenDialog(true);
    }

    function openEdit(subscription: Subscription) {
        setEditing(subscription);
        setForm({
            name: subscription.name,
            price: subscription.price,
            duration: subscription.duration,
            description: subscription.description,
        });
        setOpenDialog(true);
    }

    function closeDialog() {
        setOpenDialog(false);
        setEditing(null);
        setForm(EMPTY_FORM);
        if (error) dispatch(clearSubscriptionsError());
    }

    function handleField<K extends keyof CreateSubscriptionBody>(key: K, value: CreateSubscriptionBody[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSubmit() {
        const body: CreateSubscriptionBody = {
            name: form.name.trim(),
            price: Number(form.price),
            duration: Number(form.duration),
            description: form.description.trim(),
        };

        if (!body.name) {
            toast.error("Vui lòng nhập tên gói");
            return;
        }
        if (Number.isNaN(body.price) || body.price <= 0) {
            toast.error("Giá phải lớn hơn 0");
            return;
        }
        if (!Number.isInteger(body.duration) || body.duration <= 0) {
            toast.error("Thời hạn phải là số nguyên dương");
            return;
        }

        const action = editing
            ? await dispatch(updateSubscription({ id: editing.subscriptionId, body }))
            : await dispatch(createSubscription(body));

        if (updateSubscription.fulfilled.match(action) || createSubscription.fulfilled.match(action)) {
            toast.success(editing ? "Cập nhật gói thành công" : "Tạo gói thành công");
            closeDialog();
        } else {
            const message = (action.payload as string) ?? (editing ? "Cập nhật gói thất bại" : "Tạo gói thất bại");
            toast.error(message);
        }
    }

    const totalPrice = useMemo(() => items.reduce((sum, item) => sum + item.price, 0), [items]);

    return (
        <div className={cn("space-y-4", openSans.className)}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className={cn(bigShoulders.className, "text-2xl md:text-3xl font-bold")}>Quản lý gói đăng ký</h1>
                    <p className="text-sm text-muted-foreground">Tạo và chỉnh sửa các gói dành cho chủ sân.</p>
                </div>
                <Button onClick={openCreate} className="gap-2" disabled={saving}>
                    <Plus className="h-4 w-4" /> Thêm gói
                </Button>
            </div>

            <Card className="py-0">
                <CardHeader className="flex flex-col gap-2 border-b md:flex-row md:items-center md:justify-between">
                    <CardTitle className="text-lg font-semibold">Danh sách gói</CardTitle>
                    <Badge variant="secondary">
                        Tổng giá trị: {totalPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                    </Badge>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative">
                        {loading && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-b-xl bg-white/80 backdrop-blur-sm">
                                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                            </div>
                        )}
                        <div className={cn("w-full overflow-x-auto px-4 pb-4 transition-opacity", loading && "pointer-events-none opacity-40")}>
                            <Table className="min-w-[720px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[60px] text-center">#</TableHead>
                                    <TableHead className="text-center">Tên gói</TableHead>
                                    <TableHead className="text-center">Giá</TableHead>
                                    <TableHead className="text-center">Thời hạn (tháng)</TableHead>
                                    <TableHead>Mô tả</TableHead>
                                    <TableHead className="text-center">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item, index) => (
                                    <TableRow key={item.subscriptionId}>
                                        <TableCell className="text-center align-middle">{index + 1}</TableCell>
                                        <TableCell className="align-middle font-medium">{item.name}</TableCell>
                                        <TableCell className="text-center align-middle">
                                            {item.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                        </TableCell>
                                        <TableCell className="text-center align-middle">{item.duration}</TableCell>
                                        <TableCell className="align-middle text-sm leading-relaxed whitespace-pre-wrap">{item.description}</TableCell>
                                        <TableCell className="text-center align-middle">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-1"
                                                onClick={() => openEdit(item)}
                                                disabled={saving}
                                            >
                                                <Pencil className="h-4 w-4" /> Sửa
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {!loading && items.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                                            Chưa có gói nào.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-10 text-center">
                                            <Loader2 className="mr-2 inline h-5 w-5 animate-spin" /> Đang tải…
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={openDialog} onOpenChange={(open) => (open ? setOpenDialog(true) : closeDialog())}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Chỉnh sửa gói" : "Thêm gói mới"}</DialogTitle>
                        <DialogDescription>Thiết lập chi tiết gói đăng ký cho chủ sân.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Tên gói</label>
                            <Input
                                value={form.name}
                                onChange={(e) => handleField("name", e.target.value)}
                                placeholder="Ví dụ: Gói cơ bản"
                                disabled={saving}
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Giá (VND)</label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.price}
                                    onChange={(e) => handleField("price", Number(e.target.value))}
                                    disabled={saving}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Thời hạn (tháng)</label>
                                <Input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={form.duration}
                                    onChange={(e) => handleField("duration", Number(e.target.value))}
                                    disabled={saving}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Mô tả</label>
                            <Textarea
                                rows={4}
                                value={form.description}
                                onChange={(e) => handleField("description", e.target.value)}
                                placeholder="Ghi chú về quyền lợi gói"
                                disabled={saving}
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-4 gap-2">
                        <Button variant="outline" onClick={closeDialog} disabled={saving}>
                            Hủy
                        </Button>
                        <Button onClick={handleSubmit} disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang lưu…
                                </>
                            ) : (
                                editing ? "Cập nhật" : "Tạo"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
