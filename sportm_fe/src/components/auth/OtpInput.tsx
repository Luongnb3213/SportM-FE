"use client";

import { useRef, useState } from "react";

type OtpInputProps = {
    length?: number;                 // mặc định 6
    onChange?: (code: string) => void;
};

export default function OtpInput({ length = 6, onChange }: OtpInputProps) {
    const [vals, setVals] = useState<string[]>(Array.from({ length }, () => ""));
    const refs = useRef<Array<HTMLInputElement | null>>([]);

    const setAt = (i: number, v: string) => {
        const next = [...vals];
        next[i] = v;
        setVals(next);
        onChange?.(next.join(""));
    };

    return (
        <div className="flex items-center justify-center gap-3">
            {vals.map((val, i) => (
                <input
                    key={i}
                    ref={(el) => { refs.current[i] = el; }}  
                    value={val}
                    onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 1);
                        setAt(i, v);
                        if (v && i < length - 1) refs.current[i + 1]?.focus();
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
                        const next = [...vals];
                        for (let k = 0; k < data.length; k++) next[i + k] = data[k] ?? "";
                        setVals(next);
                        onChange?.(next.join(""));
                        const lastIdx = Math.min(i + data.length - 1, length - 1);
                        refs.current[lastIdx]?.focus();
                    }}
                    inputMode="numeric"
                    maxLength={1}
                    className="w-10 md:w-12 text-center text-xl md:text-2xl bg-transparent border-0 border-b-2 border-muted-foreground/40 focus:outline-none focus:border-foreground"
                />
            ))}
        </div>
    );
}
