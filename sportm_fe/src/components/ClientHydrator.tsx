"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUserFromCookie } from "@/lib/redux/features/auth/authSlice";
import type { User } from "@/lib/redux/features/auth/types";

export default function ClientHydrator({ user }: { user: User | null }) {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setUserFromCookie(user));
    }, [dispatch, user]); 

    return null;
}
