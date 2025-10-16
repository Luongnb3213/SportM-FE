'use client';

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useSession } from "next-auth/react";
import { setUserFromCookie } from "@/lib/redux/features/auth/authSlice";
import type { Role, User } from "@/lib/redux/features/auth/types";

function mapSessionUserToReduxUser(sessionUser: {
    id?: string;
    email?: string | null;
    name?: string | null;
    role?: Role;
}): User {
    const email = sessionUser.email ?? "";
    return {
        id: sessionUser.id ?? email,
        email,
        fullName: sessionUser.name ?? email,
        role: sessionUser.role ?? "CLIENT",
    };
}

function mapBackendUserToReduxUser(backendUser: Partial<User> & {
    userId?: string;
    phoneNumber?: string | null;
    imgUrl?: string | null;
    avatar?: string | null;
}): User {
    const email = backendUser.email ?? "";
    return {
        id: backendUser.userId ?? backendUser.id ?? email,
        email,
        fullName: backendUser.fullName ?? email,
        phone: backendUser.phone ?? backendUser.phoneNumber ?? undefined,
        role: backendUser.role ?? "CLIENT",
    };
}

function isBackendUserShape(candidate: unknown): candidate is Partial<User> & {
    userId?: string;
    phoneNumber?: string | null;
} {
    if (!candidate || typeof candidate !== "object") return false;
    const obj = candidate as Record<string, unknown>;
    return (
        typeof obj.userId === "string" ||
        typeof obj.phoneNumber === "string" ||
        typeof obj.documentUrl === "string" ||
        typeof obj.avatarUrl === "string"
    );
}

export default function ClientHydrator({ user }: { user: User | null }) {
    const dispatch = useDispatch();
    const { data: session, status } = useSession();
    const syncedTokenRef = useRef<string | null>(null);

    useEffect(() => {
        if (!user) {
            dispatch(setUserFromCookie(null));
            return;
        }
        const maybeBackend = user as unknown;
        if (isBackendUserShape(maybeBackend)) {
            dispatch(setUserFromCookie(mapBackendUserToReduxUser(maybeBackend)));
        } else {
            dispatch(setUserFromCookie(user));
        }
    }, [dispatch, user]);

    useEffect(() => {
        const backendUser = session?.backendUser as (Partial<User> & {
            imgUrl?: string | null;
            avatar?: string | null;
        }) | undefined;
        if (backendUser) {
            dispatch(setUserFromCookie(mapBackendUserToReduxUser(backendUser)));
            return;
        }

        if (session?.user) {
            dispatch(setUserFromCookie(mapSessionUserToReduxUser(session.user)));
        } else if (!user && status === "unauthenticated") {
            dispatch(setUserFromCookie(null));
        }
    }, [dispatch, session, status, user]);

    useEffect(() => {
        const backendToken = session?.backendAccessToken;
        if (!backendToken || status !== "authenticated") return;

        if (syncedTokenRef.current === backendToken) return;
        syncedTokenRef.current = backendToken;

        void fetch("/api/auth/google-sync", {
            method: "POST",
            credentials: "include",
        }).catch(() => {
            // no-op: cookie sync failing will surface when protected routes require login
        });
    }, [session?.backendAccessToken, status]);

    return null;
}
