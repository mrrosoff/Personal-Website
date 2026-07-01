import { Box, Typography } from "@mui/material";

import PromptSymbol from "../PromptSymbol";
import type { TerminalTheme } from "../Terminal";

const OutputHeader = (props: {
    theme: TerminalTheme;
    promptSymbol: string;
    children: string;
    cwd?: string;
}) => (
    <Typography
        component={"div"}
        style={{
            color: props.theme.outputColor,
            whiteSpace: "pre-wrap",
            wordBreak: "break-all"
        }}
    >
        <Box component={"span"} sx={{ display: "inline-flex", verticalAlign: "middle", mr: 1 }}>
            <PromptSymbol {...props} cwd={props.cwd}>
                {props.promptSymbol}
            </PromptSymbol>
        </Box>
        {props.children}
    </Typography>
);

export default OutputHeader;
