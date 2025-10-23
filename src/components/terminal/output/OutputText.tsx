import { Typography } from "@mui/material";
import { TerminalTheme } from "../Terminal";

const OutputText = (props: { theme: TerminalTheme; children: string }) => {
    return props.children.split("\n").map((line: string, key: number) => (
        <Typography key={key} style={{ color: props.theme.outputColor }}>
            {line}
        </Typography>
    ));
};

export default OutputText;
