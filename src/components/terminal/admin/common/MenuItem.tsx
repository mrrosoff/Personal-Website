import { Typography } from "@mui/material";

import { TerminalTheme } from "../../Terminal";

const MenuItem = (props: {
    selected: boolean;
    theme?: TerminalTheme;
    children: React.ReactNode;
    onClick?: () => void;
    onMouseEnter?: () => void;
    disabled?: boolean;
}) => (
    <Typography
        onClick={props.disabled ? undefined : props.onClick}
        onMouseEnter={props.disabled ? undefined : props.onMouseEnter}
        style={{
            color: props.selected
                ? props.theme?.commandColor || "#FFFFFF"
                : props.theme?.outputColor || "#FCFCFC",
            backgroundColor: props.selected ? "rgba(255,255,255,0.1)" : "transparent",
            padding: "4px 8px",
            marginBottom: 4,
            cursor: props.disabled ? "default" : props.onClick ? "pointer" : "default",
            userSelect: "none",
            opacity: props.disabled ? 0.4 : 1,
            pointerEvents: props.disabled ? "none" : undefined
        }}
    >
        {props.selected ? "> " : "  "}
        {props.children}
    </Typography>
);

export default MenuItem;
