import { Typography } from "@mui/material";

const OutputError = (props: { theme: Record<string, any>; children: string }) => {
    return props.children.split("\n").map((line: string, key: number) => (
        <Typography key={key} style={{ color: props.theme.errorColor }}>
            {line}
        </Typography>
    ));
};

export default OutputError;
