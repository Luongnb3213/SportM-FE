"use client";

import { useCallback, useEffect, useState } from "react";

export type OwnerDashboardStats = {
    totalRevenue: number;
    cancelledOrders: number;
    completedOrders: number;
    pendingDepositOrders: number;
    mostBookedCourt: {
        name: string;
        count: number;
    } | null;
    leastBookedCourt: {
        name: string;
        count: number;
    } | null;
    monthlyBookingStats: Array<{
        month: string;
        count: number;
    }>;
};

type HookState = {
    data: OwnerDashboardStats | null;
    loading: boolean;
    error: string | null;
};

type ApiResponse = {
    status: string;
    statusCode: number;
    data: OwnerDashboardStats;
};

export function useOwnerDashboard() {
    const [state, setState] = useState<HookState>({
        data: null,
        loading: true,
        error: null,
    });

    const fetchStats = useCallback(async () => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const res = await fetch("/api/manage/dashboard", { method: "GET" });
            if (!res.ok) {
                const message = await res.text();
                throw new Error(message || "Không thể tải thống kê");
            }

            const json = (await res.json()) as ApiResponse;
            setState({ data: json.data, loading: false, error: null });
        } catch (error: unknown) {
            setState({
                data: null,
                loading: false,
                error: error instanceof Error ? error.message : "Đã xảy ra lỗi",
            });
        }
    }, []);

    useEffect(() => {
        void fetchStats();
    }, [fetchStats]);

    return {
        data: state.data,
        loading: state.loading,
        error: state.error,
        refetch: fetchStats,
    };
}

