import { Box } from "@mui/material";

import type { TerminalTheme } from "../../Terminal";

const Stepper = (props: {
    value: string | number;
    width: string;
    theme?: TerminalTheme;
    onStep: (key: "ArrowLeft" | "ArrowRight") => void;
}) => {
    const arrowStyles = {
        cursor: "pointer",
        padding: "0 8px",
        opacity: 0.6,
        "&:active": { opacity: 1 }
    };

    return (
        <Box
            component="span"
            sx={{
                display: "inline-flex",
                alignItems: "center",
                userSelect: "none",
                color: props.theme?.commandColor || "#FFFFFF"
            }}
        >
            <Box
                component="span"
                onClick={(e) => {
                    e.stopPropagation();
                    props.onStep("ArrowLeft");
                }}
                sx={arrowStyles}
            >
                {"<"}
            </Box>
            <Box component="span" sx={{ minWidth: props.width, textAlign: "center" }}>
                {props.value}
            </Box>
            <Box
                component="span"
                onClick={(e) => {
                    e.stopPropagation();
                    props.onStep("ArrowRight");
                }}
                sx={arrowStyles}
            >
                {">"}
            </Box>
        </Box>
    );
};

export default Stepper;
