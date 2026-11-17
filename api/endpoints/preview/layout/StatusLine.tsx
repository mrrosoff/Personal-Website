import type { ReactNode } from "react";
import { DateTime } from "luxon";

import { COLORS } from "../../../../site/theme";

export type StatusLineProps = { label: string; status: string; ok: boolean };

export default function StatusLine({ label, status, ok }: StatusLineProps) {
    return (
        <span style={{ display: "flex", width: "100%" }}>
            <span>{label}</span>
            <span
                style={{
                    flex: 1,
                    margin: "0 16px",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    color: COLORS.muted
                }}
            >
                {". ".repeat(40)}
            </span>
            <span style={{ color: ok ? COLORS.green : COLORS.red }}>{status}</span>
        </span>
    );
}

type StatusLinesProps = { children: ReactNode };

export function StatusLines({ children }: StatusLinesProps) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 18, width: 560 }}>
            {children}
        </div>
    );
}

export function expiry(exp: number): { date: string; expired: boolean } {
    const expires = DateTime.fromSeconds(exp, { zone: "America/Los_Angeles" });
    return {
        date: expires.toFormat("LLL d, h:mm a").toUpperCase(),
        expired: expires < DateTime.now()
    };
}
