import type { ReactNode } from "react";

import profile from "../../../../public/images/profile.jpg";
import { COLORS, FONT } from "../../../../site/theme";

type FrameProps = { children: ReactNode };

export default function Frame({ children }: FrameProps) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 48,
                width: "100%",
                height: "100%",
                padding: "42px 54px",
                backgroundColor: COLORS.background,
                color: COLORS.text,
                fontFamily: FONT.family,
                fontSize: 46
            }}
        >
            <div style={{ display: "flex", flexDirection: "column", flex: 1, height: "100%" }}>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        flex: 1,
                        gap: 32
                    }}
                >
                    {children}
                </div>
                <span style={{ color: COLORS.muted, fontSize: 34 }}>maxrosoff.com</span>
            </div>
            <img
                src={`data:image/jpeg;base64,${profile}`}
                width={440}
                height={440}
                style={{ borderRadius: 220, border: `6px solid ${COLORS.green}` }}
            />
        </div>
    );
}

type TextProps = { children: ReactNode };

export function Title({ children }: TextProps) {
    return <span style={{ fontSize: 80 }}>{children}</span>;
}

export function Subtitle({ children }: TextProps) {
    return <span style={{ color: COLORS.muted }}>{children}</span>;
}

type ChipsProps = { flavors: { productId: string; name: string; color: string }[] };

export function Chips({ flavors }: ChipsProps) {
    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 8 }}>
            {flavors.map((flavor) => (
                <div
                    key={flavor.productId}
                    style={{
                        display: "flex",
                        padding: "8px 20px",
                        border: `2px solid ${COLORS.muted}`,
                        borderRadius: 6,
                        fontSize: 36,
                        color: flavor.color.toLowerCase() || COLORS.text
                    }}
                >
                    {flavor.name}
                </div>
            ))}
        </div>
    );
}
