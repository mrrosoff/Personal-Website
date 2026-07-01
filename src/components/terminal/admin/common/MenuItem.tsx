import { Typography } from "@mui/material";

import type { TerminalTheme } from "../../Terminal";

const MenuItem = (props: {
    selected: boolean;
    theme?: TerminalTheme;
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
}) => {
    const clickable = props.onClick && !props.disabled;
    return (
        <Typography
            onClick={
                clickable
                    ? (e) => {
                          e.stopPropagation();
                          props.onClick?.();
                      }
                    : undefined
            }
            style={{
                color: props.selected
                    ? props.theme?.commandColor || "#FFFFFF"
                    : props.theme?.outputColor || "#FCFCFC",
                backgroundColor: props.selected ? "rgba(255,255,255,0.1)" : "transparent",
                padding: "4px 8px",
                marginBottom: 4,
                userSelect: "none",
                cursor: clickable ? "pointer" : undefined,
                opacity: props.disabled ? 0.4 : 1
            }}
        >
            {props.selected ? "> " : "  "}
            {props.children}
        </Typography>
    );
};

export default MenuItem;
