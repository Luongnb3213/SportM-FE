"use client";

import dynamic from "next/dynamic";

export type MapPickerValue = {
    lat: number | null;
    lng: number | null;
};

export type MapPickerProps = {
    value: MapPickerValue;
    onChange: (value: { lat: number; lng: number }) => void;
    onAddressSelect?: (address: string) => void;
    className?: string;
};

const MapPickerInner = dynamic<MapPickerProps>(
    () => import("./MapPickerInner").then((mod) => mod.default),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-64 w-full items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
                Đang tải bản đồ...
            </div>
        ),
    },
);

export default function MapPicker(props: MapPickerProps) {
    return <MapPickerInner {...props} />;
}
