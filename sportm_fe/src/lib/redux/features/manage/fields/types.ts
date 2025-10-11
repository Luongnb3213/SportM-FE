import type { PaginationMeta } from "@/lib/redux/types";

export type Court = {
    courtId: string;
    courtName: string;
    courtImages: string[];
    address: string;
    description: string | null;
    subService: string | null;
    isActive: boolean;
    pricePerHour: number;
    lat: number | null;
    lng: number | null;
    sportType: {
        typeName: string;
        sportTypeId?: string;
    } | null;
    avgRating: number | null;
};

export type FetchCourtsParams = {
    page: number;
    limit: number;
    search?: string;
    sportTypeId?: string;
};

export type ListCourtsPayload = {
    items: Court[];
    meta: PaginationMeta;
};

export type CourtPayload = {
    name: string;
    address: string;
    imgUrls: string[];
    sportType: string;
    description?: string;
    pricePerHour?: number;
    subService?: string;
    lat?: number | null;
    lng?: number | null;
};

export type CreateCourtBody = CourtPayload;
export type UpdateCourtBody = Partial<CourtPayload>;
