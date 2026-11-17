import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";

import { TERMINAL_COLORS } from "../../terminal/Terminal";

type UnlockProps = { onUnlock: () => Promise<void> };

export default function Unlock({ onUnlock }: UnlockProps) {
    const navigate = useNavigate();
    const [busy, setBusy] = useState(false);

    const attempt = useCallback(async () => {
        setBusy(true);
        try {
            await onUnlock();
        } catch {
            void navigate("/", { replace: true });
        }
    }, [onUnlock, navigate]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (busy || event.metaKey || event.ctrlKey || event.altKey) return;
            if (event.key.length === 1 || event.key === "Enter") {
                void attempt();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [attempt, busy]);

    return (
        <Box
            sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                userSelect: "none"
            }}
        >
            <Box
                onClick={busy ? undefined : () => void attempt()}
                sx={{
                    color: TERMINAL_COLORS.outputColor,
                    cursor: busy ? "default" : "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    transition: "color 180ms ease-out",
                    ...(!busy && {
                        "&:hover": { color: TERMINAL_COLORS.promptSymbolColor },
                        "&:hover .unlock-shackle": {
                            transform: "translateY(-2px) rotate(14deg)"
                        }
                    })
                }}
            >
                <Box
                    component={"svg"}
                    viewBox={"0 0 24 24"}
                    sx={{
                        width: 34,
                        height: 34,
                        overflow: "visible",
                        display: "block"
                    }}
                >
                    <Box
                        component={"path"}
                        className={"unlock-shackle"}
                        d={"M8 12 V8 Q8 6 10 6 H14 Q16 6 16 8 V12"}
                        sx={{
                            fill: "none",
                            stroke: "currentColor",
                            strokeWidth: 1.75,
                            strokeLinecap: "square",
                            transformBox: "fill-box",
                            transformOrigin: "100% 100%",
                            transform: busy ? "translateY(-2px) rotate(14deg)" : "none",
                            transition: "transform 200ms ease-out"
                        }}
                    />
                    <Box
                        component={"rect"}
                        x={4}
                        y={12}
                        rx={0.5}
                        sx={{
                            width: 16,
                            height: 9,
                            fill: "none",
                            stroke: "currentColor",
                            strokeWidth: 1.75,
                            strokeLinejoin: "miter"
                        }}
                    />
                    <Box
                        component={"rect"}
                        x={11.25}
                        y={15}
                        sx={{ width: 1.5, height: 3.5, fill: "currentColor" }}
                    />
                </Box>
                <Typography sx={{ fontSize: "0.9em", opacity: 0.7 }}>
                    {busy ? "Authenticating" : "Unlock"}
                    {busy && (
                        <Box
                            component={"span"}
                            sx={{
                                display: "inline-block",
                                width: "3ch",
                                textAlign: "left",
                                verticalAlign: "bottom",
                                overflow: "hidden",
                                whiteSpace: "nowrap"
                            }}
                        >
                            <Box
                                component={"span"}
                                sx={{
                                    display: "inline-block",
                                    overflow: "hidden",
                                    verticalAlign: "bottom",
                                    whiteSpace: "nowrap",
                                    animation: "unlock-dots 1.2s steps(4, end) infinite",
                                    "@keyframes unlock-dots": {
                                        from: { width: 0 },
                                        to: { width: "4ch" }
                                    }
                                }}
                            >
                                ...
                            </Box>
                        </Box>
                    )}
                </Typography>
            </Box>
        </Box>
    );
}
