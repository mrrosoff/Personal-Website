import { useState, useEffect } from "react";
import { Typography } from "@mui/material";

import { TerminalTheme } from "../../Terminal";

const LoadingDots = (props: { theme?: TerminalTheme }) => {
    const [dots, setDots] = useState(".");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <Typography sx={{ color: props.theme?.outputColor || "#FCFCFC", mb: 2 }}>
            Loading inventory{dots}
        </Typography>
    );
};

export default LoadingDots;
