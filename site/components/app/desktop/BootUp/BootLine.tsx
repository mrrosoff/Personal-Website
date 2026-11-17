import { Box, Typography } from "@mui/material";

import { TERMINAL_COLORS } from "../../../terminal/Terminal";

type BootLineProps = {
    label: string;
    dots: number;
    status?: { text: string; ok: boolean };
};

export default function BootLine(props: BootLineProps) {
    return (
        <Typography>
            {props.label}
            {" .".repeat(props.dots)}
            {props.status && (
                <Box
                    component="span"
                    sx={{
                        color: props.status.ok
                            ? TERMINAL_COLORS.promptSymbolColor
                            : TERMINAL_COLORS.errorColor
                    }}
                >
                    {` ${props.status.text} `}
                </Box>
            )}
        </Typography>
    );
}
