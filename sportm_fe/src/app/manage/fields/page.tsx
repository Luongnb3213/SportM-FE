// src/app/manage/fields/page.tsx
"use client";

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import type { AppDispatch } from "@/lib/redux/store";
import type { RootState } from "@/lib/redux/store";
import {
    fetchCourts,
    createCourt,
    updateCourt,
} from "@/lib/redux/features/manage/fields/fieldsSlice";
import { fetchSportTypes } from "@/lib/redux/features/manage/sportTypes/sportTypesSlice";
import type { Court } from "@/lib/redux/features/manage/fields/types";
import { cn } from "@/lib/utils";
import { bigShoulders, openSans } from "@/styles/fonts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, PenSquare, Plus } from "lucide-react";
import MapPicker from "@/components/ui/map/MapPicker";

const PAGE_SIZE_DEFAULT = 10;
const IMG_URLS_MAX_HINT = 10;

type CourtFormState = {
    name: string;
    address: string;
    sportTypeId: string;
    pricePerHour: string;
    subService: string;
    description: string;
    lat: string;
    lng: string;
    imageList: string;
};

const emptyForm: CourtFormState = {
    name: "",
    address: "",
    sportTypeId: "",
    pricePerHour: "",
    subService: "",
    description: "",
    lat: "",
    lng: "",
    imageList: "",
};

function parseOptionalNumber(value: string): number | undefined {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const num = Number(trimmed);
    return Number.isFinite(num) ? num : undefined;
}

export default function ManageFieldsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { items, meta, loading } = useSelector((state: RootState) => state.courts);
    const sportTypes = useSelector((state: RootState) => state.sportTypes.items);
    const [sportTypesFetched, setSportTypesFetched] = useState(false);

    // table/filter state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(PAGE_SIZE_DEFAULT);
    const [search, setSearch] = useState("");
    const [filterSportTypeId, setFilterSportTypeId] = useState<string>("all");

    // create dialog state
    const [openCreate, setOpenCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState<CourtFormState>(emptyForm);

    // edit dialog state
    const [openEdit, setOpenEdit] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<CourtFormState>(emptyForm);
    const [updating, setUpdating] = useState(false);

    const pageTotal = useMemo(() => meta?.totalPages ?? 1, [meta]);

    useEffect(() => {
        const params = {
            page,
            limit,
            search: search.trim() || undefined,
            sportTypeId: filterSportTypeId !== "all" ? filterSportTypeId : undefined,
        };
        dispatch(fetchCourts(params));
    }, [dispatch, page, limit, search, filterSportTypeId]);

    useEffect(() => {
        if (sportTypesFetched) return;
        setSportTypesFetched(true);
        dispatch(fetchSportTypes({ page: 1, limit: 100 }));
    }, [dispatch, sportTypesFetched]);

    function resetFormState() {
        setForm(emptyForm);
    }

    function resetEditState() {
        setEditingId(null);
        setEditForm(emptyForm);
    }

    function mapCourtToForm(court: Court): CourtFormState {
        const sportTypeIdFromName =
            sportTypes.find((type) => type.typeName === court.sportType?.typeName)?.sportTypeId ?? "";

        return {
            name: court.courtName ?? "",
            address: court.address ?? "",
            sportTypeId: sportTypeIdFromName,
            pricePerHour: court.pricePerHour != null ? String(court.pricePerHour) : "",
            subService: court.subService ?? "",
            description: court.description ?? "",
            lat: court.lat != null ? String(court.lat) : "",
            lng: court.lng != null ? String(court.lng) : "",
            imageList: Array.isArray(court.courtImages) ? court.courtImages.join("\n") : "",
        };
    }

    function parseImageList(raw: string): string[] {
        return raw
            .split(/\r?\n|,/)
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
    }

    function buildPayload(state: CourtFormState) {
        const latNumber = parseOptionalNumber(state.lat);
        const lngNumber = parseOptionalNumber(state.lng);
        const priceNumber = parseOptionalNumber(state.pricePerHour);

        const payload = {
            name: state.name.trim(),
            address: state.address.trim(),
            sportType: state.sportTypeId.trim(),
            imgUrls: parseImageList(state.imageList),
            description: state.description.trim() || undefined,
            subService: state.subService.trim() || undefined,
            pricePerHour: priceNumber,
            lat: latNumber,
            lng: lngNumber,
        };

        return payload;
    }

    function validateForm(state: CourtFormState): string | null {
        if (!state.name.trim()) return "Vui lòng nhập tên sân";
        if (!state.address.trim()) return "Vui lòng nhập địa chỉ";
        if (!state.sportTypeId) return "Vui lòng chọn loại hình thể thao";

        const images = parseImageList(state.imageList);
        if (images.length === 0) return "Vui lòng thêm ít nhất một đường dẫn ảnh";
        if (images.length > IMG_URLS_MAX_HINT) return `Chỉ nên nhập tối đa ${IMG_URLS_MAX_HINT} ảnh`;

        if (state.pricePerHour.trim()) {
            const price = parseOptionalNumber(state.pricePerHour);
            if (price == null || price < 0) return "Giá thuê theo giờ không hợp lệ";
        }

        if (state.lat.trim()) {
            const lat = parseOptionalNumber(state.lat);
            if (lat == null || lat < -90 || lat > 90) return "Vĩ độ (lat) không hợp lệ";
        }
        if (state.lng.trim()) {
            const lng = parseOptionalNumber(state.lng);
            if (lng == null || lng < -180 || lng > 180) return "Kinh độ (lng) không hợp lệ";
        }

        return null;
    }

    async function handleCreate() {
        const err = validateForm(form);
        if (err) {
            toast.error(err);
            return;
        }

        setCreating(true);
        try {
            const payload = buildPayload(form);
            const res = await dispatch(createCourt(payload));
            if (createCourt.fulfilled.match(res)) {
                toast.success("Tạo sân thành công");
                setOpenCreate(false);
                resetFormState();
                setPage(1);
            } else {
                toast.error(res.payload ?? "Tạo sân thất bại");
            }
        } finally {
            setCreating(false);
        }
    }

    function openEditDialog(court: Court) {
        setEditingId(court.courtId);
        setEditForm(mapCourtToForm(court));
        setOpenEdit(true);
    }

    async function handleUpdate() {
        if (!editingId) return;

        const err = validateForm(editForm);
        if (err) {
            toast.error(err);
            return;
        }

        setUpdating(true);
        try {
            const payload = buildPayload(editForm);
            const res = await dispatch(updateCourt({ id: editingId, body: payload }));
            if (updateCourt.fulfilled.match(res)) {
                toast.success("Cập nhật sân thành công");
                setOpenEdit(false);
                resetEditState();
            } else {
                toast.error(res.payload ?? "Cập nhật sân thất bại");
            }
        } finally {
            setUpdating(false);
        }
    }

    function fmtCurrency(input?: number | null) {
        if (input == null) return "-";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(input);
    }

    return (
        <div className="space-y-5">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className={cn(bigShoulders.className, "text-2xl font-bold md:text-3xl")}>Quản lý sân</h1>
                    <p className={cn(openSans.className, "text-muted-foreground text-sm")}>
                        Tạo mới và điều chỉnh thông tin sân thể thao.
                    </p>
                </div>

                <Dialog open={openCreate} onOpenChange={(open) => {
                    setOpenCreate(open);
                    if (!open) {
                        setCreating(false);
                        resetFormState();
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2" size="sm">
                            <Plus className="h-4 w-4" />
                            Tạo sân
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl w-[min(95vw,1100px)] max-h-[90vh] overflow-y-auto sm:max-w-[1100px]">
                        <DialogHeader>
                            <DialogTitle>Thêm sân mới</DialogTitle>
                            <DialogDescription>Điền đầy đủ thông tin để đăng ký sân.</DialogDescription>
                        </DialogHeader>
                        <CourtFormFields
                            state={form}
                            onChange={setForm}
                            sportTypes={sportTypes}
                        />
                        <DialogFooter className="mt-4 gap-2">
                            <Button
                                variant="outline"
                                disabled={creating}
                                onClick={() => {
                                    setOpenCreate(false);
                                    setCreating(false);
                                    resetFormState();
                                }}
                            >
                                Hủy
                            </Button>
                            <Button onClick={handleCreate} disabled={creating}>
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

            <Card className={cn(openSans.className, "border")}>
                <CardHeader className="py-4">
                    <CardTitle className="text-lg">Bộ lọc</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-2">
                        <Label>Từ khóa</Label>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <Input
                                placeholder="Tên sân, địa chỉ..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button
                                variant="secondary"
                                className="w-full sm:w-auto"
                                disabled={loading}
                                onClick={() => setPage(1)}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang tìm...
                                    </>
                                ) : "Tìm"}
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label>Loại hình</Label>
                        <Select
                            value={filterSportTypeId}
                            onValueChange={(value) => {
                                setFilterSportTypeId(value);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger><SelectValue placeholder="Tất cả" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                {sportTypes.map((type) => (
                                    <SelectItem key={type.sportTypeId} value={type.sportTypeId}>
                                        {type.typeName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label>Mỗi trang</Label>
                        <Select
                            value={String(limit)}
                            onValueChange={(value) => {
                                setLimit(Number(value));
                                setPage(1);
                            }}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card className={cn(openSans.className, "py-0")}>
                <CardContent className="p-0">
                    <div className="relative">
                        {loading && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-b-xl bg-white/80 backdrop-blur-sm">
                                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                            </div>
                        )}
                        <div className={cn("w-full overflow-x-auto transition-opacity", loading && "pointer-events-none opacity-40")}>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[200px]">Tên sân</TableHead>
                                        <TableHead className="min-w-[160px]">Loại hình</TableHead>
                                        <TableHead className="min-w-[200px]">Địa chỉ</TableHead>
                                        <TableHead>Giá/giờ</TableHead>
                                        <TableHead className="min-w-[180px]">Dịch vụ kèm</TableHead>
                                        <TableHead className="min-w-[160px]">Trạng thái</TableHead>
                                        <TableHead className="min-w-[120px]" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((court: Court) => (
                                        <TableRow key={court.courtId}>
                                            <TableCell>
                                                <div className="font-medium">{court.courtName}</div>
                                                <div className="text-xs text-muted-foreground line-clamp-2">
                                                    {court.description || "Không có mô tả"}
                                                </div>
                                            </TableCell>
                                            <TableCell>{court.sportType?.typeName ?? "-"}</TableCell>
                                            <TableCell>
                                                <div className="text-sm">{court.address}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {court.lat != null && court.lng != null ? `(${court.lat}, ${court.lng})` : "Chưa định vị"}
                                                </div>
                                            </TableCell>
                                            <TableCell>{fmtCurrency(court.pricePerHour)}</TableCell>
                                            <TableCell>{court.subService || "-"}</TableCell>
                                            <TableCell>
                                                <Badge variant={court.isActive ? "default" : "secondary"}>
                                                    {court.isActive ? "Đang hoạt động" : "Tạm khóa"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="gap-2"
                                                    onClick={() => openEditDialog(court)}
                                                >
                                                    <PenSquare className="h-4 w-4" />
                                                    Sửa
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {!loading && items.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                                                Chưa có sân nào. Hãy nhấn <strong>Tạo sân</strong> để bắt đầu.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>

                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-muted-foreground">
                        Trang {meta?.currentPage ?? page}/{pageTotal} · Tổng {meta?.totalItems ?? 0}
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() => setPage((prev) => prev - 1)}
                        >
                            Trước
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= pageTotal}
                            onClick={() => setPage((prev) => prev + 1)}
                        >
                            Sau
                        </Button>
                    </div>
                </div>
            </Card>

            <Dialog open={openEdit} onOpenChange={(open) => {
                setOpenEdit(open);
                if (!open) {
                    setUpdating(false);
                    resetEditState();
                }
            }}>
                <DialogContent className="max-w-5xl w-[min(95vw,1100px)] max-h-[90vh] overflow-y-auto sm:max-w-[1100px]">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa sân</DialogTitle>
                        <DialogDescription>Cập nhật thông tin chi tiết của sân.</DialogDescription>
                    </DialogHeader>
                    <CourtFormFields
                        state={editForm}
                        onChange={setEditForm}
                        sportTypes={sportTypes}
                    />
                    <DialogFooter className="mt-4 gap-2">
                        <Button
                            variant="outline"
                            disabled={updating}
                            onClick={() => {
                                setOpenEdit(false);
                                setUpdating(false);
                                resetEditState();
                            }}
                        >
                            Hủy
                        </Button>
                        <Button onClick={handleUpdate} disabled={updating}>
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
        </div>
    );
}

type CourtFormFieldsProps = {
    state: CourtFormState;
    onChange: Dispatch<SetStateAction<CourtFormState>>;
    sportTypes: Array<{ sportTypeId: string; typeName: string }>;
};

function CourtFormFields({ state, onChange, sportTypes }: CourtFormFieldsProps) {
    const latValue = parseOptionalNumber(state.lat);
    const lngValue = parseOptionalNumber(state.lng);

    function handleCoordsChange(coords: { lat: number; lng: number }) {
        onChange((prev) => ({
            ...prev,
            lat: coords.lat.toFixed(6),
            lng: coords.lng.toFixed(6),
        }));
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="court-name">Tên sân</Label>
                <Input
                    id="court-name"
                    placeholder="VD: Sân 5 người A"
                    value={state.name}
                    onChange={(event) => onChange((prev) => ({ ...prev, name: event.target.value }))}
                />
            </div>

            <div className="md:col-span-2">
                <Label>Chọn vị trí trên bản đồ</Label>
                <div className="mt-2">
                    <MapPicker
                        value={{ lat: latValue ?? null, lng: lngValue ?? null }}
                        onChange={handleCoordsChange}
                        onAddressSelect={(address) => {
                            if (!address) return;
                            onChange((prev) => ({ ...prev, address }));
                        }}
                    />
                </div>
            </div>

            <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="court-address">Địa chỉ</Label>
                <Input
                    id="court-address"
                    placeholder="Số nhà, Quận/Huyện..."
                    value={state.address}
                    onChange={(event) => onChange((prev) => ({ ...prev, address: event.target.value }))}
                />
            </div>

            <div className="grid gap-2">
                <Label>Loại hình thể thao</Label>
                <Select
                    value={state.sportTypeId}
                        onValueChange={(value) => onChange((prev) => ({ ...prev, sportTypeId: value }))}
                >
                    <SelectTrigger><SelectValue placeholder="Chọn loại hình" /></SelectTrigger>
                    <SelectContent>
                        {sportTypes.map((type) => (
                            <SelectItem key={type.sportTypeId} value={type.sportTypeId}>
                                {type.typeName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="court-price">Giá thuê theo giờ (VND)</Label>
                <Input
                    id="court-price"
                    type="number"
                    min="0"
                    placeholder="Ví dụ: 150000"
                    value={state.pricePerHour}
                    onChange={(event) => onChange((prev) => ({ ...prev, pricePerHour: event.target.value }))}
                />
            </div>

            <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="court-description">Mô tả</Label>
                <Textarea
                    id="court-description"
                    rows={3}
                    placeholder="Giới thiệu ngắn về sân..."
                    value={state.description}
                    onChange={(event) => onChange((prev) => ({ ...prev, description: event.target.value }))}
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="court-sub-service">Dịch vụ kèm</Label>
                <Input
                    id="court-sub-service"
                    placeholder="VD: Thuê vợt, nước uống..."
                    value={state.subService}
                    onChange={(event) => onChange((prev) => ({ ...prev, subService: event.target.value }))}
                />
            </div>

            <div className="grid gap-2">
                <Label>Toạ độ</Label>
                <div className="grid grid-cols-2 gap-2">
                    <Input
                        placeholder="Lat"
                        value={state.lat}
                        onChange={(event) => onChange((prev) => ({ ...prev, lat: event.target.value }))}
                    />
                    <Input
                        placeholder="Lng"
                        value={state.lng}
                        onChange={(event) => onChange((prev) => ({ ...prev, lng: event.target.value }))}
                    />
                </div>
            </div>

            <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="court-images">Đường dẫn ảnh (mỗi dòng 1 URL)</Label>
                <Textarea
                    id="court-images"
                    rows={4}
                    placeholder="https://..."
                    value={state.imageList}
                    onChange={(event) => onChange((prev) => ({ ...prev, imageList: event.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                    Tối đa khoảng {IMG_URLS_MAX_HINT} ảnh để đảm bảo tốc độ tải.
                </p>
            </div>
        </div>
    );
}
