import { Typography, useMediaQuery, useTheme } from "@mui/material";
import type { TerminalTheme } from "../Terminal";

const OutputText = (props: { theme: TerminalTheme; children: string }) => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("md"));
    const text = props.children ?? "";
    return text.split("\n").map((line: string, key: number) => (
        <Typography
            key={key}
            style={{
                color: props.theme.outputColor,
                whiteSpace: smallScreen ? "pre-wrap" : "pre",
                overflowWrap: smallScreen ? "break-word" : undefined,
                paddingLeft: smallScreen ? "1.5em" : undefined,
                textIndent: smallScreen ? "-1.5em" : undefined
            }}
        >
            {line}
        </Typography>
    ));
};

export default OutputText;
