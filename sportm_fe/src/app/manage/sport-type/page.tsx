"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/lib/redux/store";
import {
    fetchSportTypes,
    createSportType,
    updateSportType,
    deleteSportType,
    type SportType,
} from "@/lib/redux/features/manage/sportTypes/sportTypesSlice";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export default function FieldTypesPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { items, meta, loading, error } = useSelector((s: RootState) => s.sportTypes);

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [q, setQ] = useState("");

    useEffect(() => {
        const t = setTimeout(() => setQ(search.trim()), 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        dispatch(fetchSportTypes({ page, limit: PAGE_SIZE, search: q }));
    }, [dispatch, page, q]);

    const totalPages = meta?.totalPages ?? 1;

    // Dialog state
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<SportType | null>(null);
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);

    // Delete state
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const title = editing ? "Sửa loại sân" : "Thêm loại sân";

    function openCreate() {
        setEditing(null);
        setName("");
        setOpen(true);
    }
    function openEdit(item: SportType) {
        setEditing(item);
        setName(item.typeName);
        setOpen(true);
    }

    async function save() {
        const trimmed = name.trim();
        if (!trimmed) {
            toast.error("Vui lòng nhập tên loại sân");
            return;
        }
        setSaving(true);
        if (editing) {
            const r = await dispatch(
                updateSportType({ id: editing.sportTypeId, name: trimmed })
            );
            setSaving(false);
            if (updateSportType.fulfilled.match(r)) {
                toast.success("Cập nhật thành công");
                setOpen(false);
            } else {
                toast.error((r.payload as string) || "Cập nhật thất bại");
            }
        } else {
            const r = await dispatch(createSportType({ name: trimmed }));
            setSaving(false);
            if (createSportType.fulfilled.match(r)) {
                toast.success("Tạo mới thành công");
                setOpen(false);
            } else {
                toast.error((r.payload as string) || "Tạo mới thất bại");
            }
        }
    }

    async function onDelete(id: string) {
        setDeletingId(id);
        const r = await dispatch(deleteSportType({ id }));
        setDeletingId(null);
        if (deleteSportType.fulfilled.match(r)) toast.success("Đã xóa");
        else toast.error((r.payload as string) || "Xóa thất bại");
        setConfirmId(null);
    }

    return (
        <div className="space-y-4">
            {/* Header + search + add */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h1 className="text-xl font-semibold">Quản lý loại sân</h1>

                <div className="flex items-center gap-2">
                    <div className="relative w-[260px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
                        <Input
                            placeholder="Tìm theo tên…"
                            className="pl-9"
                            value={search}
                            onChange={(e) => {
                                setPage(1);
                                setSearch(e.target.value);
                            }}
                        />
                    </div>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2" onClick={openCreate} disabled={saving}>
                                <Plus className="h-4 w-4" /> Thêm
                            </Button>
                        </DialogTrigger>

                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{title}</DialogTitle>
                            </DialogHeader>

                            {/* overlay loading trong dialog */}
                            {saving && (
                                <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-md">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span className="ml-2 text-sm">Đang lưu…</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tên loại sân</label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ví dụ: Basketball"
                                    disabled={saving}
                                />
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                                    Hủy
                                </Button>
                                <Button onClick={save} disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editing ? "Lưu" : "Tạo mới"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tên</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center">
                                    <div className="flex items-center justify-center gap-2 py-6">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Đang tải…</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-8 text-sm text-muted-foreground">
                                    {error ? `Lỗi: ${error}` : "Không có dữ liệu."}
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading &&
                            items.map((it) => {
                                const id = it.sportTypeId;
                                const isDeleting = deletingId === id;

                                return (
                                    <TableRow key={id}>
                                        <TableCell className="font-medium">{it.typeName}</TableCell>

                                        {/* Hiển thị đúng trạng thái */}
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2.5 w-2.5 rounded-full ${it.status ? "bg-emerald-500" : "bg-gray-300"}`} />
                                                <span className="text-sm">{it.status ? "Hoạt động" : "Không hoạt động"}</span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-right space-x-2">
                                            {it.status ? (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="hover:bg-sky-50 hover:text-sky-700"
                                                        onClick={() => openEdit(it)}
                                                        disabled={isDeleting || saving}
                                                        title="Sửa"
                                                    >
                                                        {saving && editing?.sportTypeId === id ? (
                                                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Pencil className="mr-1 h-4 w-4" />
                                                        )}
                                                        Sửa
                                                    </Button>

                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => setConfirmId(id)}
                                                        disabled={isDeleting || saving}
                                                        title="Xóa"
                                                    >
                                                        {isDeleting ? (
                                                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="mr-1 h-4 w-4" />
                                                        )}
                                                        Xóa
                                                    </Button>
                                                </>
                                            ) : (
                                                // Không hiển thị nút với item không hoạt động
                                                <span className="text-sm text-muted-foreground">—</span>
                                            )}
                                        </TableCell>

                                    </TableRow>
                                );
                            })}

                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Trang {meta?.currentPage ?? page}/{meta?.totalPages ?? 1} — Tổng {meta?.totalItems ?? 0} loại sân
                </p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={loading || page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="min-w-[74px]"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Trước"}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={loading || page >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="min-w-[74px]"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sau"}
                    </Button>
                </div>
            </div>

            {/* Confirm delete */}
            <AlertDialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa loại sân?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <Separator />
                    <p className="text-sm text-muted-foreground">Hành động này không thể hoàn tác.</p>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deletingId !== null}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => confirmId && onDelete(confirmId)}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deletingId !== null}
                        >
                            {deletingId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
