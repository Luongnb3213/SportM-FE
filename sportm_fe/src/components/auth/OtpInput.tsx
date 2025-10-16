"use client";

import { useEffect, useRef, useState } from "react";

type OtpInputProps = {
    length?: number;                 // mặc định 6
    onChange?: (code: string) => void;
};

export default function OtpInput({ length = 6, onChange }: OtpInputProps) {
    const [vals, setVals] = useState<string[]>(Array.from({ length }, () => ""));
    const refs = useRef<Array<HTMLInputElement | null>>([]);

    useEffect(() => {
        onChange?.(vals.join(""));
    }, [vals, onChange]);

    useEffect(() => {
        // Nếu prop length thay đổi, chuẩn hóa mảng
        setVals((prev) => Array.from({ length }, (_, idx) => prev[idx] ?? ""));
    }, [length]);

    const setAt = (idx: number, value: string) => {
        setVals((prev) => {
            const next = Array.from({ length }, (_, i) => prev[i] ?? "");
            next[idx] = value;
            return next;
        });
    };

    const pasteAt = (start: number, data: string) => {
        setVals((prev) => {
            const next = Array.from({ length }, (_, i) => prev[i] ?? "");
            for (let offset = 0; offset < data.length && start + offset < length; offset += 1) {
                next[start + offset] = data[offset];
            }
            return next;
        });
    };

    return (
        <div className="flex items-center justify-center gap-3">
            {vals.map((val, i) => (
                <input
                    key={i}
                    ref={(el) => { refs.current[i] = el; }}
                    value={val}
                    onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        if (!raw) {
                            setAt(i, "");
                            return;
                        }
                        if (raw.length === 1) {
                            setAt(i, raw);
                            if (i < length - 1) refs.current[i + 1]?.focus();
                            return;
                        }
                        pasteAt(i, raw);
                        const lastIdx = Math.min(i + raw.length - 1, length - 1);
                        window.setTimeout(() => refs.current[lastIdx]?.focus(), 0);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Backspace" && !vals[i] && i > 0) {
                            refs.current[i - 1]?.focus();
                            setAt(i - 1, "");
                            e.preventDefault();
                        }
                        if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
                        if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1]?.focus();
                    }}
                    onPaste={(e) => {
                        const data = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
                        if (!data) return;
                        e.preventDefault();
                        pasteAt(i, data);
                        const lastIdx = Math.min(i + data.length - 1, length - 1);
                        window.setTimeout(() => refs.current[lastIdx]?.focus(), 0);
                    }}
                    inputMode="numeric"
                    maxLength={1}
                    className="w-10 md:w-12 text-center text-xl md:text-2xl bg-transparent border-0 border-b-2 border-muted-foreground/40 focus:outline-none focus:border-foreground"
                />
            ))}
        </div>
    );
}
