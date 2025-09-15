// src/components/DebugAuth.tsx
"use client";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";

export default function DebugAuth() {
    const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);
    return (
        <pre className="p-3 rounded bg-neutral-100 text-xs overflow-auto">
            {JSON.stringify({ isAuthenticated, user }, null, 2)}
        </pre>
    );
}
