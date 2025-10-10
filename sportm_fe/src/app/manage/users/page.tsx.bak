"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/lib/redux/store";
import { fetchUsers, updateUserStatus } from "@/lib/redux/features/manage/users/usersSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

const PAGE_SIZE = 10;
type RoleFilter = "ALL" | "ADMIN" | "OWNER" | "CLIENT";

export default function ManageUsersPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { items, meta, loading, error } = useSelector((s: RootState) => s.manageUsers);

    const [page, setPage] = useState(1);
    const [role, setRole] = useState<RoleFilter>("ALL");
    const [search, setSearch] = useState("");
    const [q, setQ] = useState(""); // debounced
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        const t = setTimeout(() => setQ(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        const roleParam = role === "ALL" ? undefined : role;
        dispatch(fetchUsers({ page, limit: PAGE_SIZE, role: roleParam, search: q }));
    }, [dispatch, page, role, q]);

    const totalPages = meta?.totalPages ?? 1;

    const roleBadge = (r: "ADMIN" | "OWNER" | "CLIENT") => {
        const map: Record<"ADMIN" | "OWNER" | "CLIENT", { label: string; variant?: "secondary" | "default" | "outline" | "destructive" }> = {
            ADMIN: { label: "Admin", variant: "default" },
            OWNER: { label: "Chủ sân", variant: "secondary" },
            CLIENT: { label: "Khách", variant: "outline" },
        };
        const v = map[r];
        return <Badge variant={v.variant}>{v.label}</Badge>;
    };

    const statusDot = (s: boolean) => (
        <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${s ? "bg-emerald-500" : "bg-gray-300"}`} />
            <span className="text-sm font-medium">{s ? "Hoạt động" : "Khóa"}</span>
        </div>
    );

    async function onToggleStatus(userId: string, current: boolean) {
        const newStatus = !current;
        setUpdatingId(userId);
        const r = await dispatch(updateUserStatus({ userId, status: newStatus }));
        setUpdatingId(null);

        if (updateUserStatus.fulfilled.match(r)) {
            toast.success(`${newStatus ? "Đã kích hoạt" : "Đã vô hiệu hóa"} tài khoản`);
        } else {
            const msg = (r.payload as string) || "Cập nhật trạng thái thất bại";
            toast.error(msg);
        }
    }

    const disablePrev = loading || page <= 1;
    const disableNext = loading || page >= totalPages;

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h1 className="text-xl font-semibold">Quản lý người dùng</h1>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
                        <Input
                            placeholder="Tìm theo tên hoặc email…"
                            className="pl-9"
                            value={search}
                            onChange={(e) => {
                                setPage(1);
                                setSearch(e.target.value);
                            }}
                        />
                    </div>

                    <Select
                        value={role}
                        onValueChange={(v: RoleFilter) => {
                            setPage(1);
                            setRole(v);
                        }}
                    >
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Chọn vai trò" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tất cả vai trò</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="OWNER">Chủ sân</SelectItem>
                            <SelectItem value="CLIENT">Khách</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-lg border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Họ tên</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Số điện thoại</TableHead>
                            <TableHead>Vai trò</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">
                                    <div className="flex items-center justify-center gap-2 py-6">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Đang tải…</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading && items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                                    {error ? `Lỗi: ${error}` : "Không có dữ liệu."}
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading &&
                            items.map((u) => {
                                const isUpdating = updatingId === u.userId;
                                const nextStatus = !u.status; 
                                const baseBtnClasses =
                                    "min-w-[130px] transition-colors hover:bg-sky-300 ";

                                // Nếu là hành động vô hiệu hóa ⇒ hiển thị confirm
                                if (!nextStatus) {
                                    return (
                                        <TableRow key={u.userId}>
                                            <TableCell className="font-medium">{u.fullName}</TableCell>
                                            <TableCell>{u.email}</TableCell>
                                            <TableCell>{u.phoneNumber ?? "—"}</TableCell>
                                            <TableCell>{roleBadge(u.role)}</TableCell>
                                            <TableCell>{statusDot(u.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            disabled={isUpdating}
                                                            className={baseBtnClasses}
                                                            title="Chỉnh sửa trạng thái"
                                                        >
                                                            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                            Vô hiệu hóa
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Xác nhận vô hiệu hóa</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Tài khoản <b>{u.fullName}</b> sẽ bị khoá đăng nhập cho đến khi bạn kích hoạt lại.
                                                                Bạn chắc chắn chứ?
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => onToggleStatus(u.userId, u.status)}
                                                            >
                                                                Xác nhận
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    );
                                }

                                // Ngược lại (kích hoạt) ⇒ không cần confirm
                                return (
                                    <TableRow key={u.userId}>
                                        <TableCell className="font-medium">{u.fullName}</TableCell>
                                        <TableCell>{u.email}</TableCell>
                                        <TableCell>{u.phoneNumber ?? "—"}</TableCell>
                                        <TableCell>{roleBadge(u.role)}</TableCell>
                                        <TableCell>{statusDot(u.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => onToggleStatus(u.userId, u.status)}
                                                disabled={isUpdating}
                                                className={baseBtnClasses}
                                                title="Chỉnh sửa trạng thái"
                                            >
                                                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Kích hoạt
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Trang {meta?.currentPage ?? page}/{meta?.totalPages ?? 1} — Tổng {meta?.totalItems ?? 0} người dùng
                </p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={disablePrev}
                        className="hover:bg-sky-600"
                    >
                        Trước
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={disableNext}
                        className="hover:bg-sky-600"
                    >
                        Sau
                    </Button>
                </div>
            </div>
        </div>
    );
}
