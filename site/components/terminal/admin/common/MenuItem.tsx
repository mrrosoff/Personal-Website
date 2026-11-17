import { Typography } from "@mui/material";

import type { TerminalTheme } from "../../Terminal";
import { COLORS } from "../../../../theme";

const MenuItem = (props: {
    selected: boolean;
    theme: TerminalTheme;
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
            sx={{
                color: props.selected ? props.theme.commandColor : props.theme.outputColor,
                backgroundColor: props.selected ? COLORS.faint : "transparent",
                padding: "4px 8px",
                marginBottom: "4px",
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
