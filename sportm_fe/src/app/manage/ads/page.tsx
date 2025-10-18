// src/app/manage/ads/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/lib/redux/store";
import type { RootState } from "@/lib/redux/store";
import {
    fetchAds,
    createAd,
    updateAd,
    setAdPriority,
    setAdHome,
    recoverAd,
    deleteAd,
} from "../../../lib/redux/features/manage/ads/adSlice";
import type { Advertisement, CreateAdBody } from "@/lib/redux/features/manage/ads/types";
import { cn } from "@/lib/utils";
import { bigShoulders, openSans } from "@/styles/fonts";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/lib/cloudinary";

// shadcn
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Home, ListOrdered, Pencil, Plus, RotateCcw, Search, Loader2, Trash2 } from "lucide-react";


const PAGE_SIZE_DEFAULT = 10;
const DESCRIPTION_MAX_LENGTH = 500;

export default function ManageAdsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { items, meta, loading } = useSelector((s: RootState) => s.ads);
    const userRole = useSelector((s: RootState) => s.auth.user?.role ?? null);
    const isOwner = userRole === "OWNER";

    // query state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(PAGE_SIZE_DEFAULT);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<"all" | "true" | "false">("all");

    // create dialog
    const [openCreate, setOpenCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState<CreateAdBody>({
        title: "",
        content: "",
        imageUrl: "",
        startDate: "",
        endDate: "",
    });
    const [openEdit, setOpenEdit] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);
    const [editForm, setEditForm] = useState<CreateAdBody>({
        title: "",
        content: "",
        imageUrl: "",
        startDate: "",
        endDate: "",
    });
    const createImageInputRef = useRef<HTMLInputElement | null>(null);
    const editImageInputRef = useRef<HTMLInputElement | null>(null);
    const [createImageUploading, setCreateImageUploading] = useState(false);
    const [editImageUploading, setEditImageUploading] = useState(false);

    // priority dialog
    const [priorityId, setPriorityId] = useState<string | null>(null);
    const [priorityOrder, setPriorityOrder] = useState<string>("0");
    const [prioritySaving, setPrioritySaving] = useState(false);
    const [homeLoadingId, setHomeLoadingId] = useState<string | null>(null);
    const [recoverLoadingId, setRecoverLoadingId] = useState<string | null>(null);
    const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const onOpenPriority = (id: string, order?: number | null) => {
        if (isOwner) return;
        setPriorityId(id);
        setPrioritySaving(false);
        if (typeof order === "number" && Number.isFinite(order)) setPriorityOrder(String(order));
        else setPriorityOrder("0");
    };

    // fetch list
    useEffect(() => {
        const st = status === "all" ? undefined : status === "true";
        dispatch(fetchAds({ page, limit, search: search.trim() || undefined, status: st }));
    }, [dispatch, page, limit, search, status]);

    const pageTotal = useMemo(() => meta?.totalPages ?? 1, [meta]);
    const emptyColSpan = isOwner ? 7 : 9;

    const startMinLocal = minFutureLocal();
    const createEndMinLocal = minFutureLocal(form.startDate);
    const editEndMinLocal = minFutureLocal(editForm.startDate);

    function resetForm() {
        setForm({ title: "", content: "", imageUrl: "", startDate: "", endDate: "" });
    }
    function resetEditForm() {
        setEditingId(null);
        setEditForm({ title: "", content: "", imageUrl: "", startDate: "", endDate: "" });
    }

    function triggerImagePicker(mode: "create" | "edit") {
        const ref = mode === "create" ? createImageInputRef : editImageInputRef;
        ref.current?.click();
    }

    async function handleImageFileSelected(
        event: ChangeEvent<HTMLInputElement>,
        mode: "create" | "edit",
    ) {
        const file = event.target.files?.[0] ?? null;
        event.target.value = "";
        if (!file) return;

        const setUploading = mode === "create" ? setCreateImageUploading : setEditImageUploading;
        setUploading(true);
        try {
            const uploaded = await uploadToCloudinary(file, { folder: "sportm/ads" });
            const url = uploaded.secure_url || uploaded.url;
            if (!url) throw new Error("Không lấy được URL ảnh từ Cloudinary");
            if (mode === "create") {
                setForm((prev) => ({ ...prev, imageUrl: url }));
            } else {
                setEditForm((prev) => ({ ...prev, imageUrl: url }));
            }
            toast.success("Upload ảnh lên Cloudinary thành công");
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Upload ảnh thất bại");
        } finally {
            setUploading(false);
        }
    }

    async function handleCreate() {
        if (createImageUploading) {
            toast.error("Vui lòng chờ upload ảnh hoàn tất");
            return;
        }
        if (!form.title || !form.imageUrl || !form.startDate || !form.endDate) {
            toast.error("Vui lòng nhập Tiêu đề, ảnh và thời gian bắt đầu/kết thúc");
            return;
        }
        const now = new Date();
        const startDateObj = new Date(form.startDate);
        const endDateObj = new Date(form.endDate);
        if (Number.isNaN(startDateObj.getTime()) || Number.isNaN(endDateObj.getTime())) {
            toast.error("Thời gian không hợp lệ");
            return;
        }
        if (startDateObj < now) {
            toast.error("Thời gian bắt đầu phải nằm trong tương lai");
            return;
        }
        if (endDateObj <= startDateObj) {
            toast.error("Thời gian kết thúc phải sau thời gian bắt đầu");
            return;
        }
        setCreating(true);
        try {
            const res = await dispatch(createAd(form));
            if (createAd.fulfilled.match(res)) {
                toast.success("Tạo quảng cáo thành công");
                setOpenCreate(false);
                resetForm();
                // reload trang đầu để thấy mục mới
                setPage(1);
            } else {
                toast.error(res.payload ?? "Tạo quảng cáo thất bại");
            }
        } finally {
            setCreating(false);
        }
    }

    function openEditDialog(ad: Advertisement) {
        setEditingId(ad.advertisementId);
        setEditForm({
            title: ad.title ?? "",
            content: (ad.content ?? "").slice(0, DESCRIPTION_MAX_LENGTH),
            imageUrl: ad.imageUrl ?? "",
            startDate: ad.startDate ?? "",
            endDate: ad.endDate ?? "",
        });
        setUpdating(false);
        setOpenEdit(true);
    }

    async function handleUpdate() {
        if (!editingId) return;
        if (editImageUploading) {
            toast.error("Vui lòng chờ upload ảnh hoàn tất");
            return;
        }
        if (!editForm.title || !editForm.imageUrl || !editForm.startDate || !editForm.endDate) {
            toast.error("Vui lòng nhập Tiêu đề, ảnh và thời gian bắt đầu/kết thúc");
            return;
        }
        const now = new Date();
        const startDateObj = new Date(editForm.startDate);
        const endDateObj = new Date(editForm.endDate);
        if (Number.isNaN(startDateObj.getTime()) || Number.isNaN(endDateObj.getTime())) {
            toast.error("Thời gian không hợp lệ");
            return;
        }
        if (startDateObj < now) {
            toast.error("Thời gian bắt đầu phải nằm trong tương lai");
            return;
        }
        if (endDateObj <= startDateObj) {
            toast.error("Thời gian kết thúc phải sau thời gian bắt đầu");
            return;
        }
        setUpdating(true);
        try {
            const res = await dispatch(updateAd({ id: editingId, body: editForm }));
            if (updateAd.fulfilled.match(res)) {
                toast.success("Cập nhật quảng cáo thành công");
                setOpenEdit(false);
                resetEditForm();
            } else {
                toast.error(res.payload ?? "Cập nhật quảng cáo thất bại");
            }
        } finally {
            setUpdating(false);
        }
    }

    async function handleSetHome(id: string, current?: boolean | null) {
        if (isOwner) return;
        const nextIsHome = !Boolean(current);
        setHomeLoadingId(id);
        try {
            const res = await dispatch(setAdHome({ id, isHome: nextIsHome }));
            if (setAdHome.fulfilled.match(res)) toast.success(nextIsHome ? "Đã gắn trang chủ" : "Đã gỡ khỏi trang chủ");
            else toast.error(res.payload ?? "Cập nhật trạng thái trang chủ thất bại");
        } finally {
            setHomeLoadingId(null);
        }
    }

    async function handleSetPriority() {
        if (isOwner) return;
        if (!priorityId) return;
        const order = Number(priorityOrder);
        if (Number.isNaN(order) || order < 0) {
            toast.error("Thứ tự phải là số không âm");
            return;
        }
        setPrioritySaving(true);
        try {
            const res = await dispatch(setAdPriority({ id: priorityId, order }));
            if (setAdPriority.fulfilled.match(res)) {
                toast.success("Cập nhật thứ tự thành công");
                setPriorityId(null);
            } else toast.error(res.payload ?? "Cập nhật thứ tự thất bại");
        } finally {
            setPrioritySaving(false);
        }
    }

    async function handleRecover(id: string) {
        if (isOwner) return;
        setRecoverLoadingId(id);
        try {
            const ok = await dispatch(recoverAd({ id }));
            if (recoverAd.fulfilled.match(ok)) toast.success("Đã khôi phục");
            else toast.error(ok.payload ?? "Khôi phục thất bại");
        } finally {
            setRecoverLoadingId(null);
        }
    }

    function openDeleteDialog(id: string) {
        setConfirmDeleteId(id);
    }

    async function handleDeleteConfirmed() {
        if (!confirmDeleteId) return;
        setDeleteLoadingId(confirmDeleteId);
        try {
            const res = await dispatch(deleteAd({ id: confirmDeleteId }));
            if (deleteAd.fulfilled.match(res)) {
                toast.success("Đã xóa quảng cáo");
            } else {
                toast.error(res.payload ?? "Xóa quảng cáo thất bại");
            }
        } finally {
            setDeleteLoadingId(null);
            setConfirmDeleteId(null);
        }
    }

    return (
        <div className={cn("space-y-4", openSans.className)}>
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h1 className={cn(bigShoulders.className, "text-2xl md:text-3xl font-bold")}>Quản lý Quảng cáo</h1>

                <Dialog open={openCreate} onOpenChange={(open) => {
                        setOpenCreate(open);
                        if (!open) {
                            setCreating(false);
                            resetForm();
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button className="gap-2"><Plus className="h-4 w-4" />Tạo quảng cáo</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl">
                            <DialogHeader>
                                <DialogTitle>Tạo quảng cáo</DialogTitle>
                                <DialogDescription>Nhập thông tin quảng cáo mới.</DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Tiêu đề</Label>
                                    <Input
                                        id="title"
                                        placeholder="Tiêu đề hiển thị"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="content">Mô tả</Label>
                                    <Textarea
                                        id="content"
                                        rows={4}
                                        maxLength={DESCRIPTION_MAX_LENGTH}
                                        value={form.content}
                                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                                    />
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Tối đa {DESCRIPTION_MAX_LENGTH} ký tự</span>
                                        <span>{form.content.length}/{DESCRIPTION_MAX_LENGTH}</span>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="img">Ảnh quảng cáo</Label>
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                        <Input
                                            id="img"
                                            className="sm:flex-1"
                                            placeholder="URL sẽ tự điền sau khi upload"
                                            value={form.imageUrl}
                                            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() => triggerImagePicker("create")}
                                                disabled={createImageUploading}
                                            >
                                                {createImageUploading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Đang tải...
                                                    </>
                                                ) : (
                                                    "Upload ảnh"
                                                )}
                                            </Button>
                                            {form.imageUrl && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setForm((prev) => ({ ...prev, imageUrl: "" }))}
                                                    disabled={createImageUploading}
                                                >
                                                    Xóa
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <input
                                        ref={createImageInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(event) => handleImageFileSelected(event, "create")}
                                    />
                                    {form.imageUrl && (
                                        <div className="h-36 w-full max-w-xs overflow-hidden rounded border">
                                            <Image
                                                src={form.imageUrl}
                                                alt="Xem trước ảnh quảng cáo"
                                                width={320}
                                                height={320}
                                                className="h-full w-full object-cover"
                                                unoptimized
                                            />
                                        </div>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Chỉ hỗ trợ 1 ảnh. Ảnh được tải lên Cloudinary và URL sẽ tự động điền.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Thời gian bắt đầu</Label>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 opacity-70" />
                                            <Input
                                                type="datetime-local"
                                                min={startMinLocal}
                                                value={toLocalDatetime(form.startDate)}
                                                onChange={(e) => setForm({ ...form, startDate: fromLocalDatetime(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Thời gian kết thúc</Label>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 opacity-70" />
                                            <Input
                                                type="datetime-local"
                                                min={createEndMinLocal}
                                                value={toLocalDatetime(form.endDate)}
                                                onChange={(e) => setForm({ ...form, endDate: fromLocalDatetime(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="mt-4 gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setOpenCreate(false);
                                        setCreating(false);
                                        resetForm();
                                    }}
                                    disabled={creating || createImageUploading}
                                >
                                    Hủy
                                </Button>
                                <Button onClick={handleCreate} disabled={creating || createImageUploading}>
                                    {creating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Đang tạo...
                                        </>
                                    ) : "Tạo"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                </Dialog>
            </div>

            <Dialog open={openEdit} onOpenChange={(open) => {
                setOpenEdit(open);
                if (!open) {
                    setUpdating(false);
                    resetEditForm();
                }
            }}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa quảng cáo</DialogTitle>
                        <DialogDescription>Điều chỉnh thông tin quảng cáo và lưu thay đổi.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-1 grid gap-2">
                            <Label htmlFor="edit-title">Tiêu đề</Label>
                            <Input
                                id="edit-title"
                                placeholder="Tiêu đề hiển thị"
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2 grid gap-2">
                            <Label htmlFor="edit-content">Mô tả</Label>
                            <Textarea
                                id="edit-content"
                                rows={4}
                                maxLength={DESCRIPTION_MAX_LENGTH}
                                value={editForm.content}
                                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                            />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Tối đa {DESCRIPTION_MAX_LENGTH} ký tự</span>
                                <span>{editForm.content.length}/{DESCRIPTION_MAX_LENGTH}</span>
                            </div>
                        </div>
                        <div className="md:col-span-1 grid gap-2">
                            <Label htmlFor="edit-img">Ảnh quảng cáo</Label>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <Input
                                    id="edit-img"
                                    className="sm:flex-1"
                                    placeholder="URL sẽ tự điền sau khi upload"
                                    value={editForm.imageUrl}
                                    onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                                />
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => triggerImagePicker("edit")}
                                        disabled={editImageUploading}
                                    >
                                        {editImageUploading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Đang tải...
                                            </>
                                        ) : (
                                            "Upload ảnh"
                                        )}
                                    </Button>
                                    {editForm.imageUrl && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setEditForm((prev) => ({ ...prev, imageUrl: "" }))}
                                            disabled={editImageUploading}
                                        >
                                            Xóa
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <input
                                ref={editImageInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(event) => handleImageFileSelected(event, "edit")}
                            />
                            {editForm.imageUrl && (
                                <div className="h-36 w-full max-w-xs overflow-hidden rounded border">
                                    <Image
                                        src={editForm.imageUrl}
                                        alt="Ảnh quảng cáo hiện tại"
                                        width={320}
                                        height={320}
                                        className="h-full w-full object-cover"
                                        unoptimized
                                    />
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Chỉ hỗ trợ 1 ảnh. URL sẽ cập nhật sau khi upload lên Cloudinary.
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label>Thời gian bắt đầu</Label>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 opacity-70" />
                                <Input
                                    type="datetime-local"
                                    min={startMinLocal}
                                    value={toLocalDatetime(editForm.startDate)}
                                    onChange={(e) => setEditForm({ ...editForm, startDate: fromLocalDatetime(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Thời gian kết thúc</Label>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 opacity-70" />
                                <Input
                                    type="datetime-local"
                                    min={editEndMinLocal}
                                    value={toLocalDatetime(editForm.endDate)}
                                    onChange={(e) => setEditForm({ ...editForm, endDate: fromLocalDatetime(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="mt-4 gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setOpenEdit(false);
                                setUpdating(false);
                                resetEditForm();
                            }}
                            disabled={updating || editImageUploading}
                        >
                            Hủy
                        </Button>
                        <Button onClick={handleUpdate} disabled={updating || editImageUploading}>
                            {updating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : "Lưu"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Filters */}
            <Card className="mb-6">
                <CardHeader className="py-3">
                    <CardTitle className="text-lg">Bộ lọc</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:items-center">
                        <div className="relative w-full">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
                            <Input
                                className="pl-8"
                                placeholder="Từ khóa"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => setPage(1)}
                            className="w-full sm:w-auto"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang tìm...
                                </>
                            ) : "Tìm"}
                        </Button>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Label className="whitespace-nowrap">Trạng thái</Label>
                        <Select value={status} onValueChange={(v: "all" | "true" | "false") => { setStatus(v); setPage(1); }}>
                            <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="--" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="true">Đang bật</SelectItem>
                                <SelectItem value="false">Đang ẩn</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center md:justify-end">
                        <Label className="whitespace-nowrap">Mỗi trang</Label>
                        <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                            <SelectTrigger className="w-full sm:w-[120px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="py-0">
                <CardContent className="p-0">
                    <div className="relative">
                        {loading && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-b-xl bg-white/80 backdrop-blur-sm">
                                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                            </div>
                        )}
                        <div className={cn("w-full overflow-x-auto transition-opacity", loading && "pointer-events-none opacity-40")}>
                        <Table className="min-w-[720px]">
                            <TableHeader>
                            <TableRow>
                                <TableHead className="w-[60px] text-center">#</TableHead>
                                <TableHead className="text-center">Tiêu đề</TableHead>
                                <TableHead className="text-center">Nội dung</TableHead>
                                <TableHead className="text-center">Ảnh</TableHead>
                                <TableHead className="hidden md:table-cell text-center">Khoảng thời gian</TableHead>
                                <TableHead className="text-center">Trạng thái</TableHead>
                                {!isOwner && <TableHead className="hidden md:table-cell text-center">Thứ tự</TableHead>}
                                {!isOwner && <TableHead className="hidden md:table-cell text-center">Trang chủ</TableHead>}
                                <TableHead className="pr-4 text-center">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((ad, idx) => {
                                const counter = (meta?.itemsPerPage ?? limit) * ((meta?.currentPage ?? page) - 1) + idx + 1;
                                const orderValue =
                                    typeof ad.displayOrder === "number" && Number.isFinite(ad.displayOrder)
                                        ? ad.displayOrder
                                        : null;
                                const isHome = ad.displayHome === true;
                                const homeLabel = ad.displayHome === null ? "Chưa gán" : isHome ? "Trang chủ" : "Không";
                                const statusLabel = ad.status ? "Đang bật" : "Đang ẩn";
                                const statusVariant = ad.status ? "default" : "secondary";

                                return (
                                    <TableRow key={ad.advertisementId}>
                                        <TableCell className="align-middle text-center">{counter}</TableCell>
                                        <TableCell className="align-middle text-center">
                                            <div className="flex flex-col items-center justify-center gap-1">
                                                <div className="font-medium break-words">{ad.title}</div>
                                                <div className="text-xs opacity-60">Tạo lúc: {fmtDate(ad.createdAt)}</div>
                                            </div>
                                            <div className="mt-2 flex flex-wrap justify-center gap-2 md:hidden">
                                                <Badge variant={statusVariant}>{statusLabel}</Badge>
                                                {!isOwner && (
                                                    <>
                                                        <Badge variant={isHome ? "secondary" : "outline"}>{homeLabel}</Badge>
                                                        {orderValue !== null && <Badge variant="outline">Ưu tiên: {orderValue}</Badge>}
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-middle text-center text-sm md:w-[400px] lg:w-[400px]">
                                            {ad.content ? (
                                                <p className="mx-auto w-full max-w-[400px] break-words whitespace-pre-wrap text-sm leading-relaxed line-clamp-6">
                                                    {ad.content}
                                                </p>
                                            ) : (
                                                <span className="text-xs opacity-60">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="align-middle text-center">
                                            {ad.imageUrl ? (
                                                <div className="mx-auto h-24 w-32 overflow-hidden rounded-md border bg-muted">
                                                    <Image
                                                        src={ad.imageUrl}
                                                        alt={ad.title || "Advertisement image"}
                                                        width={160}
                                                        height={120}
                                                        className="h-full w-full object-cover"
                                                        unoptimized
                                                    />
                                                </div>
                                            ) : (
                                                <div className="mx-auto flex h-24 w-32 items-center justify-center rounded-md border text-xs opacity-60">
                                                    Không có ảnh
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell align-middle text-center text-sm">
                                            <div>{fmtDate(ad.startDate)} → {fmtDate(ad.endDate)}</div>
                                        </TableCell>
                                        <TableCell className="align-middle text-center text-sm">
                                            <Badge variant={statusVariant}>{statusLabel}</Badge>
                                        </TableCell>
                                        {!isOwner && (
                                            <TableCell className="hidden md:table-cell align-middle text-center text-sm">
                                                {orderValue !== null ? orderValue : "—"}
                                            </TableCell>
                                        )}
                                        {!isOwner && (
                                            <TableCell className="hidden md:table-cell align-middle text-center text-sm">
                                                <Badge variant={isHome ? "secondary" : "outline"}>{homeLabel}</Badge>
                                            </TableCell>
                                        )}
                                        <TableCell className="align-middle pr-4 text-center">
                                            <div className="flex flex-row flex-wrap items-center justify-center gap-2 md:flex-nowrap md:gap-3">
                                                {/* Edit */}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-1"
                                                    onClick={() => openEditDialog(ad)}
                                                    title="Chỉnh sửa"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    Sửa
                                                </Button>

                                                {!isOwner && (
                                                    <>
                                                        {/* Priority */}
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            className="gap-1"
                                                            onClick={() => onOpenPriority(ad.advertisementId, ad.displayOrder)}
                                                            title="Đặt thứ tự ưu tiên"
                                                        >
                                                            <ListOrdered className="h-4 w-4" />
                                                            Ưu tiên
                                                        </Button>

                                                        {/* Toggle Home */}
                                                        <Button
                                                            size="sm"
                                                            variant={isHome ? "destructive" : "default"}
                                                            className="gap-1"
                                                            onClick={() => handleSetHome(ad.advertisementId, ad.displayHome)}
                                                            disabled={homeLoadingId === ad.advertisementId}
                                                        >
                                                            {homeLoadingId === ad.advertisementId ? (
                                                                <>
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                    Đang cập nhật...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Home className="h-4 w-4" />
                                                                    {isHome ? "Bỏ trang chủ" : "Gắn trang chủ"}
                                                                </>
                                                            )}
                                                        </Button>

                                                        {/* Recover */}
                                                        {!ad.status && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="gap-1"
                                                                onClick={() => handleRecover(ad.advertisementId)}
                                                                title="Khôi phục"
                                                                disabled={recoverLoadingId === ad.advertisementId}
                                                            >
                                                                {recoverLoadingId === ad.advertisementId ? (
                                                                    <>
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                        Đang khôi phục...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <RotateCcw className="h-4 w-4" />
                                                                        Khôi phục
                                                                    </>
                                                                )}
                                                            </Button>
                                                        )}
                                                    </>
                                                )}

                                                {/* Delete */}
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="gap-1"
                                                    onClick={() => openDeleteDialog(ad.advertisementId)}
                                                    disabled={deleteLoadingId === ad.advertisementId}
                                                >
                                                    {deleteLoadingId === ad.advertisementId ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                            Đang xóa...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Trash2 className="h-4 w-4" />
                                                            Xóa
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}

                            {!loading && items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={emptyColSpan} className="py-10 text-center opacity-70">
                                        Không có dữ liệu
                                    </TableCell>
                                </TableRow>
                            )}
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={emptyColSpan} className="py-10 text-center">
                                        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                                    </TableCell>
                                </TableRow>
                            )}
                            </TableBody>
                        </Table>
                    </div>
                    </div>
                </CardContent>

                {/* Pagination */}
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-center opacity-75 sm:text-left">
                        Trang {meta?.currentPage ?? page}/{pageTotal} · Tổng {meta?.totalItems ?? 0}
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            Trước
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= pageTotal}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Sau
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Confirm delete */}
            <AlertDialog
                open={!!confirmDeleteId}
                onOpenChange={(open) => {
                    if (!open && deleteLoadingId === null) setConfirmDeleteId(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa quảng cáo?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Quảng cáo sẽ bị xóa vĩnh viễn.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteLoadingId !== null}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={handleDeleteConfirmed}
                            disabled={deleteLoadingId !== null}
                        >
                            {deleteLoadingId !== null ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xóa...
                                </>
                            ) : (
                                "Xóa"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Priority Dialog */}
            {!isOwner && (
                <Dialog open={!!priorityId} onOpenChange={(open) => {
                    if (!open) {
                        setPriorityId(null);
                        setPrioritySaving(false);
                    }
                }}>
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Đặt thứ tự ưu tiên</DialogTitle>
                            <DialogDescription>Giá trị càng nhỏ càng ưu tiên (0, 1, 2...)</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-2">
                            <Label>Thứ tự</Label>
                            <Input
                                value={priorityOrder}
                                onChange={(e) => setPriorityOrder(e.target.value)}
                                placeholder="0, 1, 2..."
                            />
                        </div>
                        <DialogFooter className="mt-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setPriorityId(null);
                                    setPrioritySaving(false);
                                }}
                                disabled={prioritySaving}
                            >
                                Hủy
                            </Button>
                            <Button onClick={handleSetPriority} disabled={prioritySaving}>
                                {prioritySaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : "Lưu"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}

/* ===== Helpers ===== */
function fmtDate(iso?: string) {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
}
// Convert ISO -> input[type=datetime-local] value (yyyy-MM-ddTHH:mm)
function toLocalDatetime(iso: string) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
// Convert back to ISO (with timezone awareness)
function fromLocalDatetime(local: string) {
    if (!local) return "";
    const d = new Date(local);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString();
}

function minFutureLocal(baseIso?: string) {
    const now = new Date();
    if (baseIso) {
        const candidate = new Date(baseIso);
        if (!Number.isNaN(candidate.getTime()) && candidate > now) {
            return toLocalDatetime(candidate.toISOString());
        }
    }
    return toLocalDatetime(now.toISOString());
}
