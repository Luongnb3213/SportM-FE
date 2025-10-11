"use client";

import { useEffect, useRef, useState } from "react";
import type { MapPickerProps } from "./MapPicker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LatLngExpression, LeafletMouseEvent, LatLngTuple } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER: LatLngTuple = [10.762622, 106.660172];
const DEFAULT_ZOOM = 13;
const NOMINATIM_HEADERS = {
    "User-Agent": "SportM-FE/1.0 (mailto:contact@example.com)",
};

const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

type SearchResult = {
    lat: string;
    lon: string;
    display_name: string;
};

function normalizeDisplayName(name: string): string {
    if (!name) return "";
    const parts = name.split(",").map((part) => part.trim());
    const filtered = parts.filter((part) => !/^\d+$/.test(part));
    return filtered.join(", ");
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
        const url = new URL("https://nominatim.openstreetmap.org/reverse");
        url.searchParams.set("format", "json");
        url.searchParams.set("lat", String(lat));
        url.searchParams.set("lon", String(lng));
        url.searchParams.set("zoom", "18");
        url.searchParams.set("addressdetails", "0");

        const res = await fetch(url.toString(), { headers: NOMINATIM_HEADERS });
        if (!res.ok) return null;
        const json = (await res.json()) as { display_name?: string };
        return typeof json.display_name === "string" ? json.display_name : null;
    } catch {
        return null;
    }
}

export default function MapPickerInner({ value, onChange, onAddressSelect, className }: MapPickerProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [position, setPosition] = useState<LatLngTuple>(() => {
        if (value.lat != null && value.lng != null) return [value.lat, value.lng];
        return DEFAULT_CENTER;
    });

    useEffect(() => {
        if (value.lat != null && value.lng != null) {
            const coords: LatLngTuple = [value.lat, value.lng];
            setPosition(coords);
            initialPositionRef.current = coords;
        }
    }, [value.lat, value.lng]);

    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const latestReverseRequestRef = useRef(0);
    const onChangeRef = useRef(onChange);
    const onAddressSelectRef = useRef(onAddressSelect);
    const initialPositionRef = useRef<LatLngTuple>(position);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        onAddressSelectRef.current = onAddressSelect;
    }, [onAddressSelect]);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;
        const map = L.map(containerRef.current).setView(initialPositionRef.current, DEFAULT_ZOOM);
        mapRef.current = map;
        const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        });
        tileLayer.addTo(map);

        const marker = L.marker(initialPositionRef.current, { icon: DefaultIcon }).addTo(map);
        markerRef.current = marker;

        const clickHandler = async (event: LeafletMouseEvent) => {
            const coords = { lat: event.latlng.lat, lng: event.latlng.lng };
            const coordsTuple: LatLngTuple = [coords.lat, coords.lng];
            marker.setLatLng(event.latlng);
            map.panTo(event.latlng);
            onChangeRef.current?.(coords);
            setPosition(coordsTuple);
            if (onAddressSelectRef.current) {
                const requestId = Date.now();
                latestReverseRequestRef.current = requestId;
                const display = await reverseGeocode(coords.lat, coords.lng);
                if (display && latestReverseRequestRef.current === requestId) {
                    const normalized = normalizeDisplayName(display);
                    onAddressSelectRef.current?.(normalized);
                    setSearchTerm(normalized);
                }
            }
        };
        map.on("click", clickHandler);

        const resizeObserver = new ResizeObserver(() => {
            map.invalidateSize();
        });
        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
            map.off("click", clickHandler);
            map.remove();
            mapRef.current = null;
            markerRef.current = null;
        };
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        const marker = markerRef.current;
        if (!map || !marker) return;
        const latlng: LatLngExpression = position;
        marker.setLatLng(latlng);
        map.panTo(latlng);
    }, [position]);

    async function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const query = searchTerm.trim();
        if (!query) return;
        setSearching(true);
        setSearchError(null);
        try {
            const url = new URL("https://nominatim.openstreetmap.org/search");
            url.searchParams.set("format", "json");
            url.searchParams.set("limit", "5");
            url.searchParams.set("q", query);

            const res = await fetch(url.toString(), { headers: NOMINATIM_HEADERS });

            if (!res.ok) {
                throw new Error(`Tra cứu thất bại (${res.status})`);
            }

            const json = (await res.json()) as SearchResult[];
            setResults(json);
            if (json.length === 0) setSearchError("Không tìm thấy địa điểm phù hợp");
        } catch (error) {
            setSearchError(error instanceof Error ? error.message : "Tra cứu thất bại");
        } finally {
            setSearching(false);
        }
    }

    function handleSelectResult(result: SearchResult) {
        const lat = Number(result.lat);
        const lng = Number(result.lon);
        if (Number.isNaN(lat) || Number.isNaN(lng)) return;
        const coordsTuple: LatLngTuple = [lat, lng];
        setPosition(coordsTuple);
        onChangeRef.current?.({ lat, lng });
        const normalized = normalizeDisplayName(result.display_name);
        onAddressSelectRef.current?.(normalized);
        setSearchTerm(normalized);
        setResults([]);
    }

    return (
        <div className={cn("flex flex-col gap-3", className)}>
            <form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleSearchSubmit}>
                <Input
                    placeholder="Tìm kiếm địa chỉ (Ví dụ: 123 Nguyễn Huệ, TP.HCM)"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="flex-1"
                />
                <Button type="submit" disabled={searching} className="sm:w-auto">
                    {searching ? "Đang tìm..." : "Tìm trên bản đồ"}
                </Button>
            </form>

            {searchError && (
                <div className="text-sm text-destructive">
                    {searchError}
                </div>
            )}

            {results.length > 0 && (
                <div className="max-h-40 overflow-y-auto rounded-md border bg-muted/30 p-2 text-sm">
                    {results.map((item) => {
                        const display = normalizeDisplayName(item.display_name);
                        return (
                        <button
                            key={`${item.lat}-${item.lon}`}
                            type="button"
                            onClick={() => handleSelectResult(item)}
                            className="w-full rounded-md px-2 py-1 text-left hover:bg-muted"
                        >
                            {display}
                        </button>
                        );
                    })}
                </div>
            )}

            <div className="relative h-64 w-full overflow-hidden rounded-md border">
                <div ref={containerRef} className="h-full w-full" />
            </div>
            <p className="text-xs text-muted-foreground">
                Nhấn vào bản đồ để chọn vị trí hoặc tìm kiếm địa chỉ phía trên. Tọa độ lat/lng sẽ tự động điền vào biểu mẫu.
            </p>
        </div>
    );
}
