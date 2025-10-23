import { Typography } from "@mui/material";
import { TerminalTheme } from "../Terminal";

const OutputError = (props: { theme: TerminalTheme; children: string }) => {
    return props.children.split("\n").map((line: string, key: number) => (
        <Typography key={key} style={{ color: props.theme.errorColor }}>
            {line}
        </Typography>
    ));
};

export default OutputError;
