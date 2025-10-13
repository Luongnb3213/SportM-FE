import type { Role, User as BackendUser } from "@/lib/redux/features/auth/types";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        accessToken?: string; // deprecated - kept for backward compatibility
        idToken?: string; // deprecated
        googleAccessToken?: string;
        googleIdToken?: string;
        backendAccessToken?: string;
        backendUser?: Partial<BackendUser> & {
            id?: string;
            email?: string;
            fullName?: string | null;
            role?: Role;
            phone?: string | null;
            imgUrl?: string | null;
            avatar?: string | null;
        };
        user?: DefaultSession["user"] & {
            id: string;
            role: Role;
            fullName?: string | null;
        };
    }

    interface User {
        role?: Role;
        backendAuth?: {
            accessToken: string;
            user: Partial<BackendUser> & {
                id?: string;
                email?: string;
                fullName?: string | null;
                role?: Role;
                phone?: string | null;
                imgUrl?: string | null;
                avatar?: string | null;
            };
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string; // deprecated
        idToken?: string; // deprecated
        googleAccessToken?: string;
        googleIdToken?: string;
        backend?: {
            accessToken: string;
            user: Partial<BackendUser> & {
                id?: string;
                email?: string;
                fullName?: string | null;
                role?: Role;
                phone?: string | null;
                imgUrl?: string | null;
                avatar?: string | null;
            };
        };
        user?: {
            id?: string;
            email?: string | null;
            name?: string | null;
            image?: string | null;
            role?: Role;
        };
    }
}
