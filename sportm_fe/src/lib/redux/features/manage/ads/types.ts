// BE: /advertisement
export type Advertisement = {
    advertisementId: string;
    title: string;
    content: string;
    imageUrl: string;
    startDate: string;          // ISO
    endDate: string;            // ISO
    status: boolean;            // đang bật/ẩn
    displayOrder: number | null;
    displayHome: boolean | null;
    createdAt?: string;         // ISO
};

export type FetchAdsParams = {
    page: number;
    limit: number;
    search?: string;
    status?: boolean;
};

export type PaginationMeta = {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
};

export type ListAdsPayload = { items: Advertisement[]; meta: PaginationMeta };

export type CreateAdBody = {
    title: string;
    content: string;
    imageUrl: string;
    startDate: string; // ISO
    endDate: string;   // ISO
};

export type UpdateAdBody = CreateAdBody;
