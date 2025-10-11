"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/lib/redux/store";
import {
    fetchUsers,
    updateUserStatus,
    updateUserRole,
} from "@/lib/redux/features/manage/users/usersSlice";
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
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;
type RoleFilter = "ALL" | "ADMIN" | "OWNER" | "CLIENT";

const ROLE_OPTIONS: RoleFilter[] = ["ALL", "ADMIN", "OWNER", "CLIENT"];

const ROLE_LABEL: Record<"ADMIN" | "OWNER" | "CLIENT", string> = {
    ADMIN: "Admin",
    OWNER: "Chủ sân",
    CLIENT: "Khách",
};

const ROLE_VARIANT: Record<"ADMIN" | "OWNER" | "CLIENT", "default" | "secondary" | "outline"> = {
    ADMIN: "default",
    OWNER: "secondary",
    CLIENT: "outline",
};

export default function ManageUsersPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { items, meta, loading, error } = useSelector((s: RootState) => s.manageUsers);

    const [page, setPage] = useState(1);
    const [role, setRole] = useState<RoleFilter>("ALL");
    const [search, setSearch] = useState("");
    const [q, setQ] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [roleTarget, setRoleTarget] = useState<{ userId: string; fullName: string; current: "ADMIN" | "OWNER" | "CLIENT" } | null>(null);
    const [roleRequesting, setRoleRequesting] = useState(false);
    const [newRole, setNewRole] = useState<"OWNER" | "CLIENT">("OWNER");

    useEffect(() => {
        const debounce = setTimeout(() => setQ(search.trim()), 300);
        return () => clearTimeout(debounce);
    }, [search]);

    useEffect(() => {
        const roleParam = role === "ALL" ? undefined : role;
        dispatch(fetchUsers({ page, limit: PAGE_SIZE, role: roleParam, search: q }));
    }, [dispatch, page, role, q]);

    useEffect(() => {
        if (error) toast.error(error, { duration: 2000 });
    }, [error]);

    const totalPages = meta?.totalPages ?? 1;
    const disablePrev = loading || page <= 1;
    const disableNext = loading || page >= totalPages;

    const roleBadge = (r: "ADMIN" | "OWNER" | "CLIENT") => (
        <Badge variant={ROLE_VARIANT[r]}>{ROLE_LABEL[r]}</Badge>
    );

    const statusDot = (s: boolean) => (
        <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${s ? "bg-emerald-500" : "bg-gray-300"}`} />
            <span className="text-sm font-medium">{s ? "Hoạt động" : "Khóa"}</span>
        </div>
    );

    async function handleStatus(userId: string, current: boolean) {
        const nextStatus = !current;
        setUpdatingId(userId);
        const action = await dispatch(updateUserStatus({ userId, status: nextStatus }));
        setUpdatingId(null);

        if (updateUserStatus.fulfilled.match(action)) {
            toast.success(nextStatus ? "Đã kích hoạt tài khoản" : "Đã khóa tài khoản");
        } else {
            toast.error((action.payload as string) ?? "Cập nhật trạng thái thất bại");
        }
    }

    function openRoleDialog(userId: string, fullName: string, current: "ADMIN" | "OWNER" | "CLIENT") {
        setRoleTarget({ userId, fullName, current });
        setNewRole(current === "OWNER" ? "CLIENT" : "OWNER");
        setRoleDialogOpen(true);
    }

    async function handleRoleSubmit() {
        if (!roleTarget) return;
        setRoleRequesting(true);
        const action = await dispatch(updateUserRole({ userId: roleTarget.userId, role: newRole }));
        setRoleRequesting(false);
        if (updateUserRole.fulfilled.match(action)) {
            toast.success("Cập nhật vai trò thành công");
            setRoleDialogOpen(false);
        } else {
            toast.error((action.payload as string) ?? "Cập nhật vai trò thất bại");
        }
    }

    const renderActions = (userId: string, fullName: string, currentRole: "ADMIN" | "OWNER" | "CLIENT", status: boolean) => {
        const isUpdating = updatingId === userId;
        const showRoleBtn = currentRole === "CLIENT" || currentRole === "OWNER";
        return (
            <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                    variant={status ? "secondary" : "default"}
                    size="sm"
                    onClick={() => handleStatus(userId, status)}
                    disabled={isUpdating}
                    className="min-w-[110px]"
                >
                    {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {status ? "Vô hiệu hóa" : "Kích hoạt"}
                </Button>
                {showRoleBtn && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRoleDialog(userId, fullName, currentRole)}
                    >
                        Đổi vai trò
                    </Button>
                )}
            </div>
        );
    };

    const currentCount = items.length;

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
                            disabled={loading}
                        />
                    </div>
                    <Select
                        value={role}
                        onValueChange={(value: RoleFilter) => {
                            setPage(1);
                            setRole(value);
                        }}
                        disabled={loading}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Chọn vai trò" />
                        </SelectTrigger>
                        <SelectContent>
                            {ROLE_OPTIONS.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                    {opt === "ALL" ? "Tất cả" : ROLE_LABEL[opt]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-lg border bg-white shadow-sm">
                <div className="relative">
                    {loading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                        </div>
                    )}
                    <Table className={cn(loading && "opacity-40 pointer-events-none")}>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Họ tên</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>SĐT</TableHead>
                            <TableHead>Vai trò</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-16 text-center text-sm text-muted-foreground">
                                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Đang tải dữ liệu…
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading && currentCount === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-16 text-center text-sm text-muted-foreground">
                                    Không tìm thấy người dùng phù hợp.
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading && items.map((user) => (
                            <TableRow key={user.userId}>
                                <TableCell className="font-medium">{user.fullName}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.phoneNumber ?? "—"}</TableCell>
                                <TableCell>{roleBadge(user.role)}</TableCell>
                                <TableCell>{statusDot(user.status)}</TableCell>
                                <TableCell className="text-right">
                                    {renderActions(user.userId, user.fullName, user.role, user.status)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                </div>
            </div>

            <div className="flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                    Trang {meta?.currentPage ?? page}/{meta?.totalPages ?? 1} — Tổng {meta?.totalItems ?? 0} người dùng
                </p>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={disablePrev}>
                        Trước
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={disableNext}>
                        Sau
                    </Button>
                </div>
            </div>

            <Dialog open={roleDialogOpen} onOpenChange={(open) => (open ? setRoleDialogOpen(true) : setRoleDialogOpen(false))}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Điều chỉnh vai trò</DialogTitle>
                        <DialogDescription>
                            {roleTarget ? (
                                <span>
                                    Người dùng <b>{roleTarget.fullName}</b> hiện là <b>{ROLE_LABEL[roleTarget.current]}</b>. Chọn vai trò mới bên dưới.
                                </span>
                            ) : (
                                "Chọn vai trò mới cho người dùng."
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        <Select
                            value={newRole}
                            onValueChange={(v: "OWNER" | "CLIENT") => setNewRole(v)}
                            disabled={roleRequesting}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn vai trò" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="OWNER">Chủ sân</SelectItem>
                                <SelectItem value="CLIENT">Khách</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="mt-4 gap-2">
                        <Button variant="outline" onClick={() => setRoleDialogOpen(false)} disabled={roleRequesting}>
                            Hủy
                        </Button>
                        <Button onClick={handleRoleSubmit} disabled={roleRequesting}>
                            {roleRequesting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang lưu…
                                </>
                            ) : (
                                "Cập nhật"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
