import { useEffect, useState } from "react";
import { Box } from "@mui/material";

export default function StartingComputer() {
    const [dots, setDots] = useState(1);

    useEffect(() => {
        const interval = setInterval(() => setDots((current) => (current % 3) + 1), 250);
        return () => clearInterval(interval);
    }, []);

    return <Box>Starting Computer {".".repeat(dots)}</Box>;
}
