import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const Consultation = (_props: any) => {
    const [mainText, setMainText] = useState<string>("");
    const [secondaryText, setSecondaryText] = useState<string>("");

    const [visibleCursor, setVisibleCursor] = useState<boolean>(true);
    const [mainActiveCursor, setMainActiveCursor] = useState<boolean>(true);

    const typingSpeed = 125;
    const startDelay = 1000;
    const intermissionDelay = 1200;
    const secondStartDelay = 5500;

    useEffect(() => {
        const interval = setInterval(() => {
            setVisibleCursor((visible) => !visible);
        }, 550);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const fullMainText = "Consulting";
            let i = 0;
            const interval = setInterval(() => {
                const nextLetter = fullMainText[i];
                setMainText((mainText) => mainText + nextLetter);
                i++;
                if (i > fullMainText.length - 1) {
                    clearInterval(interval);
                    setTimeout(() => setMainActiveCursor(false), intermissionDelay);
                }
            }, typingSpeed);
        }, startDelay);
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const fullSecondaryText =
                "I provide a variety of consulting services, on and off the web.";
            let i = 0;
            const interval = setInterval(() => {
                const nextLetter = fullSecondaryText[i];
                setSecondaryText((secondaryText) => secondaryText + nextLetter);
                i++;
                if (i > fullSecondaryText.length - 1) {
                    clearInterval(interval);
                }
            }, typingSpeed - 75);
        }, secondStartDelay);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <Box display={"flex"} flexDirection={"column"}>
            <Box display={"flex"} alignItems={"center"} sx={{ height: 250 }}>
                <Typography style={{ fontSize: 150, fontWeight: 500 }}>{mainText}</Typography>
                <Box
                    id={"cursor"}
                    ml={mainText ? 2 : 0}
                    width={50}
                    height={120}
                    sx={{
                        visibility: mainActiveCursor && visibleCursor ? "visible" : "hidden",
                        background: "#FFFFFF"
                    }}
                />
            </Box>
            <Box display={"flex"} alignItems={"center"} sx={{ mt: -10, height: 200 }}>
                <Typography style={{ fontSize: 35, fontWeight: 400 }}>{secondaryText}</Typography>
                <Box
                    id={"cursor"}
                    ml={secondaryText ? 2 : 0}
                    width={12}
                    height={25}
                    sx={{
                        visibility: !mainActiveCursor && visibleCursor ? "visible" : "hidden",
                        background: "#FFFFFF"
                    }}
                />
            </Box>
        </Box>
    );
};

export default Consultation;
