import type { PaginationMeta } from "@/lib/redux/types";

export type UserRow = {
    userId: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
    avatarUrl: string | null;
    role: "ADMIN" | "OWNER" | "CLIENT";
    status: boolean;
};

export type UsersPayload = {
    items: UserRow[];
    meta: PaginationMeta; 
};
