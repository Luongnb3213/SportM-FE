"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import type { ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { Role } from "@/lib/redux/features/auth/types";
import type { RootState, AppDispatch } from "@/lib/redux/store";
import { setUserFromCookie } from "@/lib/redux/features/auth/authSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { openSans } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/redux/features/auth/utils";
import { uploadToCloudinary } from "@/lib/cloudinary";

type GenderSelection = "male" | "female" | "unspecified";

type ProfileFormState = {
    userId: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    avatarUrl: string;
    documentUrl: string;
    bio: string;
    birthDate: string;
    gender: GenderSelection;
    role: Role;
};

type PaymentFormState = {
    accountName: string;
    accountNumber: string;
    bankName: string;
    qrCodeUrl: string;
};

type PaymentInfoResponse = {
    accountName?: string | null;
    accountNumber?: string | null;
    bankName?: string | null;
    qrCodeUrl?: string | null;
} | null;

type BackendProfile = {
    userId?: string;
    id?: string;
    fullName?: string | null;
    email?: string | null;
    birthDate?: string | null;
    gender?: boolean | null;
    phoneNumber?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
    documentUrl?: string | null;
    bio?: string | null;
    role?: Role;
    paymentInfo?: PaymentInfoResponse;
};

const defaultPaymentState: PaymentFormState = {
    accountName: "",
    accountNumber: "",
    bankName: "",
    qrCodeUrl: "",
};

function parseJson(text: string) {
    if (!text) return null;
    try {
        return JSON.parse(text) as unknown;
    } catch {
        return text;
    }
}

function mapGender(value: boolean | null | undefined): GenderSelection {
    if (value === true) return "male";
    if (value === false) return "female";
    return "unspecified";
}

function serializeGender(value: GenderSelection): boolean | null {
    if (value === "male") return true;
    if (value === "female") return false;
    return null;
}

function normaliseBirthDate(value?: string | null): string {
    if (!value) return "";
    // Expecting format yyyy-mm-dd or ISO string
    if (value.length >= 10) return value.slice(0, 10);
    return value;
}

function toProfileForm(data: BackendProfile): ProfileFormState {
    return {
        userId: data.userId ?? data.id ?? "",
        fullName: data.fullName ?? "",
        email: data.email ?? "",
        phoneNumber: data.phoneNumber ?? data.phone ?? "",
        avatarUrl: data.avatarUrl ?? "",
        documentUrl: data.documentUrl ?? "",
        bio: data.bio ?? "",
        birthDate: normaliseBirthDate(data.birthDate),
        gender: mapGender(data.gender),
        role: data.role ?? "CLIENT",
    };
}

function toPaymentForm(data: PaymentInfoResponse): PaymentFormState {
    if (!data) return { ...defaultPaymentState };
    return {
        accountName: data.accountName ?? "",
        accountNumber: data.accountNumber ?? "",
        bankName: data.bankName ?? "",
        qrCodeUrl: data.qrCodeUrl ?? "",
    };
}

const genderLabel: Record<GenderSelection, string> = {
    male: "Nam",
    female: "Nữ",
    unspecified: "Không xác định",
};

const roleLabel: Record<Role, string> = {
    ADMIN: "Quản trị viên",
    OWNER: "Chủ sân",
    CLIENT: "Khách hàng",
};

function formatDisplay(value?: string | null) {
    if (!value) return "—";
    const trimmed = value.toString().trim();
    return trimmed.length ? trimmed : "—";
}

function formatDisplayDate(value?: string | null) {
    if (!value) return "—";
    const trimmed = value.trim();
    if (!trimmed) return "—";
    const date = new Date(trimmed);
    if (Number.isNaN(date.getTime())) return trimmed;
    return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(date);
}

function DisplayField({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
            </span>
            <p className="break-words text-sm font-medium text-slate-900">
                {formatDisplay(value)}
            </p>
        </div>
    );
}

function DisplayLink({ label, href }: { label: string; href?: string | null }) {
    const display = href?.trim();
    return (
        <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
            </span>
            {display ? (
                <a
                    href={display}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-slate-900 underline underline-offset-2"
                >
                    {display}
                </a>
            ) : (
                <p className="text-sm font-medium text-slate-900">—</p>
            )}
        </div>
    );
}

function DisplayImage({
    label,
    src,
    alt,
}: {
    label: string;
    src?: string | null;
    alt?: string;
}) {
    const valid = src?.trim();
    return (
        <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
            </span>
            {valid ? (
                <div className="relative h-48 w-full max-w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <Image
                        src={valid}
                        alt={alt ?? label}
                        fill
                        className="object-contain p-4"
                        sizes="320px"
                    />
                </div>
            ) : (
                <p className="text-sm font-medium text-slate-900">—</p>
            )}
        </div>
    );
}

export default function MyProfilePage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);
    const { status: sessionStatus } = useSession();
    const [hasAuthCookie, setHasAuthCookie] = useState<boolean>(false);
    const [fallbackUserId, setFallbackUserId] = useState<string>("");

    const userId = useMemo(() => {
        if (user?.id) return user.id;
        if (user && "userId" in user && typeof (user as Record<string, unknown>).userId === "string") {
            return (user as unknown as { userId: string }).userId;
        }
        return "";
    }, [user]);

    const effectiveUserId = userId || fallbackUserId;
    const isOwner = user?.role === "OWNER";

    const [profile, setProfile] = useState<ProfileFormState | null>(null);
    const [initialProfile, setInitialProfile] = useState<ProfileFormState | null>(null);
    const [payment, setPayment] = useState<PaymentFormState>(() => ({ ...defaultPaymentState }));
    const [initialPayment, setInitialPayment] = useState<PaymentFormState>({ ...defaultPaymentState });
    const [fetching, setFetching] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [profileError, setProfileError] = useState<string | null>(null);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPayment, setSavingPayment] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingPayment, setIsEditingPayment] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [qrUploading, setQrUploading] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement | null>(null);
    const qrInputRef = useRef<HTMLInputElement | null>(null);

    const fetchProfile = useCallback(async (id: string, options?: { silent?: boolean }) => {
        if (!id) return;
        const silent = options?.silent ?? false;
        if (!silent) {
            setFetching(true);
            setLoadError(null);
        }

        try {
            const res = await fetch(`/api/users/${id}`, { method: "GET", cache: "no-store" });
            const text = await res.text();
            const parsed = parseJson(text);

            if (!res.ok) {
                throw new Error(getErrorMessage(parsed, "Không thể tải thông tin người dùng."));
            }

            if (!parsed || typeof parsed !== "object") {
                throw new Error("Dữ liệu trả về không hợp lệ.");
            }

            const data = (parsed as { data?: BackendProfile }).data;
            if (!data) {
                throw new Error("Không tìm thấy thông tin người dùng.");
            }

            const mappedProfile = toProfileForm(data);
            const mappedPayment = toPaymentForm(data.paymentInfo ?? null);

            setProfile(mappedProfile);
            setInitialProfile({ ...mappedProfile });
            setPayment(mappedPayment);
            setInitialPayment({ ...mappedPayment });
            setIsEditingProfile(false);
            setIsEditingPayment(false);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.";
            if (silent) {
                toast.error(message);
            } else {
                setLoadError(message);
                setProfile(null);
            }
        } finally {
            if (!silent) {
                setFetching(false);
            }
        }
    }, []);

    function startProfileEdit() {
        if (!profile && initialProfile) {
            setProfile({ ...initialProfile });
        }
        setProfileError(null);
        setIsEditingProfile(true);
    }

    function cancelProfileEdit() {
        if (initialProfile) {
            setProfile({ ...initialProfile });
        }
        setProfileError(null);
        setIsEditingProfile(false);
    }

    function startPaymentEdit() {
        setPaymentError(null);
        setIsEditingPayment(true);
        if (qrInputRef.current) qrInputRef.current.value = "";
    }

    function cancelPaymentEdit() {
        setPayment({ ...initialPayment });
        setPaymentError(null);
        setIsEditingPayment(false);
        setQrUploading(false);
        if (qrInputRef.current) qrInputRef.current.value = "";
    }

    async function handleAvatarFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!profile) return;
        setAvatarUploading(true);
        try {
            const result = await uploadToCloudinary(file, { folder: "sportm/users" });
            setProfile((prev) => (prev ? { ...prev, avatarUrl: result.secure_url } : prev));
            toast.success("Tải ảnh thành công.");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Tải ảnh thất bại.";
            toast.error(message);
        } finally {
            setAvatarUploading(false);
            if (event.target) {
                event.target.value = "";
            }
        }
    }

    async function handleQrFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;
        setQrUploading(true);
        try {
            const result = await uploadToCloudinary(file, { folder: "sportm/payment" });
            setPayment((prev) => ({ ...prev, qrCodeUrl: result.secure_url }));
            toast.success("Tải QR thành công.");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Tải QR thất bại.";
            toast.error(message);
        } finally {
            setQrUploading(false);
            if (event.target) event.target.value = "";
        }
    }

    useEffect(() => {
        if (!effectiveUserId) return;
        fetchProfile(effectiveUserId).catch(() => undefined);
    }, [effectiveUserId, fetchProfile]);

    useEffect(() => {
        if (typeof document === "undefined") return;
        const cookie = document.cookie ?? "";
        const hasToken = cookie.split(";").some((chunk) => chunk.trim().startsWith("access_token="));
        const hasUser = cookie.split(";").some((chunk) => chunk.trim().startsWith("user="));
        setHasAuthCookie(hasToken || hasUser);
    }, [sessionStatus, isAuthenticated]);

    useEffect(() => {
        if (userId) {
            setFallbackUserId("");
            return;
        }
        if (!hasAuthCookie || typeof document === "undefined") return;
        const cookieEntry = document.cookie
            .split(";")
            .map((chunk) => chunk.trim())
            .find((chunk) => chunk.startsWith("user="));
        if (!cookieEntry) return;
        const raw = cookieEntry.slice("user=".length);
        try {
            const parsed = JSON.parse(decodeURIComponent(raw)) as Record<string, unknown>;
            const idFromCookie =
                (typeof parsed.userId === "string" && parsed.userId) ||
                (typeof parsed.id === "string" && parsed.id) ||
                (typeof parsed.email === "string" && parsed.email) ||
                "";
            if (idFromCookie) setFallbackUserId(idFromCookie);
        } catch {
            // ignore malformed cookie
        }
    }, [userId, hasAuthCookie]);

    useEffect(() => {
        if (isAuthenticated || user !== null) return;
        if (typeof document === "undefined") return;
        const cookie = document.cookie ?? "";
        const hasCreds =
            cookie.split(";").some((chunk) => chunk.trim().startsWith("access_token=")) ||
            cookie.split(";").some((chunk) => chunk.trim().startsWith("user="));

        if (!hasCreds) {
            router.replace("/login");
        }
    }, [isAuthenticated, router, user]);

    async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const targetUserId = userId || fallbackUserId;
        if (!profile || !targetUserId) return;

        setProfileError(null);
        setSavingProfile(true);

        const payload = {
            fullName: profile.fullName.trim(),
            email: profile.email.trim(),
            avatarUrl: profile.avatarUrl.trim() || null,
            phoneNumber: profile.phoneNumber.trim() || null,
            bio: profile.bio.trim() || null,
            birthDate: profile.birthDate.trim() || null,
            documentUrl: profile.documentUrl.trim() || null,
            gender: serializeGender(profile.gender),
        };

        try {
            const res = await fetch(`/api/users/${targetUserId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const text = await res.text();
            const parsed = parseJson(text);

            if (!res.ok) {
                throw new Error(getErrorMessage(parsed, "Cập nhật thông tin thất bại."));
            }

            const data = parsed && typeof parsed === "object" ? (parsed as { data?: BackendProfile }).data : null;
            if (data) {
                const updated = toProfileForm(data);
                setProfile(updated);
                setInitialProfile({ ...updated });
            } else {
                await fetchProfile(targetUserId, { silent: true });
            }

            if (user) {
                dispatch(setUserFromCookie({
                    id: targetUserId,
                    email: payload.email,
                    fullName: payload.fullName,
                    phone: payload.phoneNumber ?? undefined,
                    role: user.role,
                }));
            }

            toast.success("Đã cập nhật thông tin cá nhân.");
            setProfileError(null);
            setIsEditingProfile(false);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Cập nhật thông tin thất bại.";
            setProfileError(message);
            toast.error(message);
        } finally {
            setSavingProfile(false);
        }
    }

    async function handlePaymentSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const targetUserId = userId || fallbackUserId;
        if (!isOwner || !targetUserId) return;

        setPaymentError(null);
        setSavingPayment(true);

        const payload = {
            accountName: payment.accountName.trim() || null,
            accountNumber: payment.accountNumber.trim() || null,
            bankName: payment.bankName.trim() || null,
            qrCodeUrl: payment.qrCodeUrl.trim() || null,
        };

        try {
            const res = await fetch("/api/users/payment-info", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const text = await res.text();
            const parsed = parseJson(text);

            if (!res.ok) {
                throw new Error(getErrorMessage(parsed, "Cập nhật thông tin thanh toán thất bại."));
            }

            const paymentData =
                parsed && typeof parsed === "object"
                    ? ((parsed as { data?: BackendProfile["paymentInfo"] }).data ?? null)
                    : null;

            if (paymentData) {
                const updatedPayment = toPaymentForm(paymentData);
                setPayment(updatedPayment);
                setInitialPayment({ ...updatedPayment });
            } else {
                await fetchProfile(targetUserId, { silent: true });
            }

            toast.success("Đã cập nhật thông tin thanh toán.");
            setPaymentError(null);
            setIsEditingPayment(false);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Cập nhật thông tin thanh toán thất bại.";
            setPaymentError(message);
            toast.error(message);
        } finally {
            setSavingPayment(false);
        }
    }

    const cardClassName = "bg-white/90 text-foreground border-white/20 shadow-xl backdrop-blur";

    let content: ReactNode = null;

    if (!effectiveUserId) {
        const waitingForUser =
            sessionStatus === "loading" ||
            (sessionStatus === "authenticated" && !isAuthenticated) ||
            (hasAuthCookie && !isAuthenticated);

        content = (
            <Card className={cardClassName}>
                <CardHeader>
                    <CardTitle>
                        {waitingForUser ? "Đang chuẩn bị dữ liệu..." : "Thông tin tài khoản"}
                    </CardTitle>
                    <CardDescription>
                        {waitingForUser ? "Vui lòng đợi trong giây lát." : "Không tìm thấy tài khoản đang đăng nhập."}
                    </CardDescription>
                </CardHeader>
                {waitingForUser ? (
                    <CardContent className="py-10 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </CardContent>
                ) : null}
            </Card>
        );
    } else if (fetching) {
        content = (
            <Card className={cardClassName}>
                <CardHeader>
                    <CardTitle>Đang tải thông tin...</CardTitle>
                    <CardDescription>Vui lòng chờ trong giây lát.</CardDescription>
                </CardHeader>
                <CardContent className="py-10 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    } else if (loadError) {
        content = (
            <Card className={cardClassName}>
                <CardHeader>
                    <CardTitle>Không thể tải thông tin</CardTitle>
                    <CardDescription>{loadError}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={() => effectiveUserId && fetchProfile(effectiveUserId)}
                        className="mt-4"
                        disabled={!effectiveUserId}
                    >
                        Thử lại
                    </Button>
                </CardContent>
            </Card>
        );
    } else if (profile) {
        const initialAvatar = initialProfile?.avatarUrl ?? "";
        const currentAvatar = profile.avatarUrl ?? "";
        const avatarPreview = currentAvatar || initialAvatar || "/images/sportM.jpg";
        const hasAvatarChanged = currentAvatar !== initialAvatar;
        const initialQr = initialPayment.qrCodeUrl ?? "";
        const currentQr = payment.qrCodeUrl ?? "";
        const qrPreview = currentQr || initialQr || "";
        const hasQrChanged = currentQr !== initialQr;
        content = (
            <div className="flex flex-col gap-8">
                <Card className={cardClassName}>
                    <CardHeader>
                        <CardTitle>Thông tin cá nhân</CardTitle>
                        <CardDescription>
                            Cập nhật các thông tin cơ bản để đồng bộ với hệ thống.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isEditingProfile ? (
                            <form onSubmit={handleProfileSubmit} className={cn("space-y-6", openSans.className)}>
                                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="relative h-24 w-24 overflow-hidden rounded-full border border-white/30 bg-white/20">
                                            <Image
                                                src={avatarPreview}
                                                alt={profile.fullName || "Avatar"}
                                                fill
                                                className="object-cover"
                                                sizes="96px"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-lg font-semibold text-slate-900">{formatDisplay(profile.fullName)}</p>
                                            <p className="text-sm text-slate-500">{formatDisplay(profile.email)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            ref={avatarInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleAvatarFileChange}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => avatarInputRef.current?.click()}
                                            disabled={avatarUploading}
                                        >
                                            {avatarUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Chọn ảnh mới
                                        </Button>
                                        {hasAvatarChanged ? (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => setProfile((prev) => (prev ? { ...prev, avatarUrl: initialAvatar } : prev))}
                                                disabled={avatarUploading}
                                            >
                                                Đặt lại
                                            </Button>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Họ và tên</Label>
                                        <Input
                                            id="fullName"
                                            value={profile.fullName}
                                            onChange={(e) => setProfile((prev) => prev ? { ...prev, fullName: e.target.value } : prev)}
                                            placeholder="Nhập họ và tên"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={profile.email}
                                            readOnly
                                            disabled
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phoneNumber">Số điện thoại</Label>
                                        <Input
                                            id="phoneNumber"
                                            type="tel"
                                            value={profile.phoneNumber}
                                            onChange={(e) => setProfile((prev) => prev ? { ...prev, phoneNumber: e.target.value } : prev)}
                                            placeholder="Số điện thoại"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="birthDate">Ngày sinh</Label>
                                        <Input
                                            id="birthDate"
                                            type="date"
                                            value={profile.birthDate}
                                            onChange={(e) => setProfile((prev) => prev ? { ...prev, birthDate: e.target.value } : prev)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gender">Giới tính</Label>
                                        <Select
                                            value={profile.gender}
                                            onValueChange={(value: GenderSelection) =>
                                                setProfile((prev) => prev ? { ...prev, gender: value } : prev)
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Chọn giới tính" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="unspecified">Không xác định</SelectItem>
                                                <SelectItem value="male">Nam</SelectItem>
                                                <SelectItem value="female">Nữ</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="documentUrl">Tài liệu (URL)</Label>
                                        <Input
                                            id="documentUrl"
                                            type="url"
                                            value={profile.documentUrl}
                                            onChange={(e) => setProfile((prev) => prev ? { ...prev, documentUrl: e.target.value } : prev)}
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Vai trò</Label>
                                        <Input value={roleLabel[profile.role] ?? profile.role} disabled />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Giới thiệu</Label>
                                    <Textarea
                                        id="bio"
                                        value={profile.bio}
                                        onChange={(e) => setProfile((prev) => prev ? { ...prev, bio: e.target.value } : prev)}
                                        placeholder="Nói đôi chút về bạn..."
                                        rows={4}
                                    />
                                </div>

                                {profileError && (
                                    <p className="text-sm text-red-600">{profileError}</p>
                                )}

                                <div className="flex justify-end gap-3">
                                    <Button type="button" variant="ghost" onClick={cancelProfileEdit} disabled={savingProfile || avatarUploading}>
                                        Hủy
                                    </Button>
                                    <Button type="submit" disabled={savingProfile || avatarUploading}>
                                        {(savingProfile || avatarUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Lưu thay đổi
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className={cn("space-y-6", openSans.className)}>
                                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="relative h-24 w-24 overflow-hidden rounded-full border border-white/30 bg-white/20">
                                            <Image
                                                src={avatarPreview}
                                                alt={profile.fullName || "Avatar"}
                                                fill
                                                className="object-cover"
                                                sizes="96px"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-lg font-semibold text-slate-900">{formatDisplay(profile.fullName)}</p>
                                            <p className="text-sm text-slate-500">{formatDisplay(profile.email)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <DisplayField label="Họ và tên" value={profile.fullName} />
                                    <DisplayField label="Email" value={profile.email} />
                                    <DisplayField label="Số điện thoại" value={profile.phoneNumber} />
                                    <DisplayField label="Ngày sinh" value={formatDisplayDate(profile.birthDate)} />
                                    <DisplayField label="Giới tính" value={genderLabel[profile.gender]} />
                                    <DisplayField label="Vai trò" value={roleLabel[profile.role] ?? profile.role} />
                                    <DisplayLink label="Tài liệu" href={profile.documentUrl} />
                                </div>

                                <div className="space-y-2">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Giới thiệu
                                    </span>
                                    <p className="rounded-xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-700 whitespace-pre-line">
                                        {formatDisplay(profile.bio)}
                                    </p>
                                </div>

                                <div className="flex justify-end">
                                    <Button onClick={startProfileEdit}>Cập nhật thông tin</Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {isOwner && (
                    <Card className={cardClassName}>
                        <CardHeader>
                            <CardTitle>Thông tin thanh toán</CardTitle>
                            <CardDescription>
                                Cập nhật thông tin tài khoản ngân hàng để nhận thanh toán.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isEditingPayment ? (
                                <form onSubmit={handlePaymentSubmit} className={cn("space-y-6", openSans.className)}>
                                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-between">
                                        <div className="relative h-32 w-32 overflow-hidden rounded-xl border border-white/30 bg-white/20">
                                            {qrPreview ? (
                                                <Image
                                                    src={qrPreview}
                                                    alt="QR thanh toán"
                                                    fill
                                                    className="object-cover"
                                                    sizes="128px"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-slate-900/40 text-xs text-slate-300">
                                                    Chưa có QR
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <input
                                                ref={qrInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleQrFileChange}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => qrInputRef.current?.click()}
                                                disabled={qrUploading}
                                            >
                                                {qrUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Chọn ảnh QR
                                            </Button>
                                            {hasQrChanged ? (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => setPayment((prev) => ({ ...prev, qrCodeUrl: initialQr }))}
                                                    disabled={qrUploading}
                                                >
                                                    Đặt lại
                                                </Button>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="accountName">Chủ tài khoản</Label>
                                            <Input
                                                id="accountName"
                                                value={payment.accountName}
                                                onChange={(e) => setPayment((prev) => ({ ...prev, accountName: e.target.value }))}
                                                placeholder="NGUYEN VAN A"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="accountNumber">Số tài khoản</Label>
                                            <Input
                                                id="accountNumber"
                                                value={payment.accountNumber}
                                                onChange={(e) => setPayment((prev) => ({ ...prev, accountNumber: e.target.value }))}
                                                placeholder="0123456789"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bankName">Ngân hàng</Label>
                                            <Input
                                                id="bankName"
                                                value={payment.bankName}
                                                onChange={(e) => setPayment((prev) => ({ ...prev, bankName: e.target.value }))}
                                                placeholder="Vietcombank"
                                            />
                                        </div>
                                    </div>

                                    {paymentError && (
                                        <p className="text-sm text-red-600">{paymentError}</p>
                                    )}

                                    <div className="flex justify-end gap-3">
                                        <Button type="button" variant="ghost" onClick={cancelPaymentEdit} disabled={savingPayment || qrUploading}>
                                            Hủy
                                        </Button>
                                        <Button type="submit" disabled={savingPayment || qrUploading}>
                                            {(savingPayment || qrUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Lưu thông tin thanh toán
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className={cn("space-y-6", openSans.className)}>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <DisplayField label="Chủ tài khoản" value={payment.accountName} />
                                        <DisplayField label="Số tài khoản" value={payment.accountNumber} />
                                        <DisplayField label="Ngân hàng" value={payment.bankName} />
                                        <DisplayImage label="QR thanh toán" src={payment.qrCodeUrl} alt="QR thanh toán" />
                                    </div>

                                    <div className="flex justify-end">
                                        <Button onClick={startPaymentEdit}>Cập nhật thông tin thanh toán</Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }

    return (
        <main
            className={cn(
                "relative min-h-screen overflow-hidden text-slate-100",
                openSans.className
            )}
        >
            <div className="absolute inset-0 -z-10">
                <Image
                    src="/images/bg-homepage.jpg"
                    alt="SportM background"
                    fill
                    priority
                    className="object-cover"
                />
                <div
                    className="absolute inset-0 bg-slate-950"
                    style={{
                        background:
                            "radial-gradient(circle at top left, rgba(59,130,246,0.4), transparent 55%), radial-gradient(circle at bottom right, rgba(14,116,144,0.35), transparent 50%), linear-gradient(180deg, rgba(2,6,23,0.92) 0%, rgba(2,6,23,0.98) 100%)",
                    }}
                />
            </div>

            <div className="h-16 md:h-20" />

            <div className="relative mx-auto w-full max-w-4xl px-4 pb-24">
                {content}
            </div>
        </main>
    );
}
