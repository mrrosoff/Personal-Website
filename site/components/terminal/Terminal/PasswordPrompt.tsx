import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Box } from "@mui/material";

import type { TerminalTheme } from "../Terminal";

type PasswordPromptProps = { theme: TerminalTheme; loading: boolean; children: ReactNode };

export default function PasswordPrompt(props: PasswordPromptProps) {
    const [ticks, setTicks] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setTicks((current) => (current + 1) % 4), 600);
        return () => clearInterval(interval);
    }, []);

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box component="span" sx={{ color: props.theme.outputColor }}>
                Password:
            </Box>
            {props.loading ? (
                <Box component="span" sx={{ color: props.theme.outputColor }}>
                    {".".repeat(ticks + 1)}
                </Box>
            ) : (
                <Box
                    data-testid="cursor"
                    sx={{
                        width: 8,
                        height: 18,
                        visibility: ticks % 2 === 0 ? "visible" : "hidden",
                        background: "#FFFFFF"
                    }}
                />
            )}
            {props.children}
        </Box>
    );
}
