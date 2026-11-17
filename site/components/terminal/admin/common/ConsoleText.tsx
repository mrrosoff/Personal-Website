import type { ReactNode } from "react";

import { Typography } from "@mui/material";

import type { TerminalTheme } from "../../Terminal";

type ConsoleHeadingProps = { theme: TerminalTheme; title?: string };

export const ConsoleHeading = (props: ConsoleHeadingProps) => (
    <Typography sx={{ color: props.theme.outputColor, fontWeight: "bold", mb: 1.25 }}>
        {props.title ? `=== Admin Console (${props.title}) ===` : "=== Admin Console ==="}
    </Typography>
);

type ConsoleHintProps = { theme: TerminalTheme; spaced?: boolean; children: ReactNode };

export const ConsoleHint = (props: ConsoleHintProps) => (
    <Typography
        sx={{
            color: props.theme.outputColor,
            mt: props.spaced ? 1 : undefined,
            fontSize: "0.9em",
            opacity: 0.7
        }}
    >
        {props.children}
    </Typography>
);
