import { Typography } from "@mui/material";

import { TerminalTheme } from "../../Terminal";

const MenuItem = (props: {
    selected: boolean;
    theme?: TerminalTheme;
    children: React.ReactNode;
    onClick?: () => void;
    onMouseEnter?: () => void;
}) => (
    <Typography
        onClick={props.onClick}
        onMouseEnter={props.onMouseEnter}
        style={{
            color: props.selected
                ? props.theme?.commandColor || "#FFFFFF"
                : props.theme?.outputColor || "#FCFCFC",
            backgroundColor: props.selected ? "rgba(255,255,255,0.1)" : "transparent",
            padding: "4px 8px",
            marginBottom: 4,
            cursor: props.onClick ? "pointer" : "default",
            userSelect: "none"
        }}
    >
        {props.selected ? "> " : "  "}
        {props.children}
    </Typography>
);

export default MenuItem;
