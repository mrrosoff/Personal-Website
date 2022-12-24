import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const Consultation = (props: any) => {
    const [mainText, setMainText] = useState<string>("");
    const [secondaryText, setSecondaryText] = useState<string>("");

    const [visibleCursor, setVisibleCursor] = useState<boolean>(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setVisibleCursor((visible) => !visible);
        }, 600);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fullMainText = "Consulting";
        let i = 0;
        const interval = setInterval(() => {
            console.log(i)
            if (i > fullMainText.length) {
                clearInterval(interval);
            }
            setMainText((mainText) => mainText + fullMainText[i]);
            i++;
        }, 350);
        return () => clearInterval(interval);
    }, []);

    return (
        <Box>
            <Box display={"flex"} alignItems={"center"}>
                <Typography style={{ fontSize: 150, fontWeight: 600 }}>{mainText}</Typography>
                <Box
                    id={"cursor"}
                    ml={2}
                    width={65}
                    height={150}
                    sx={{
                        visibility: visibleCursor ? "visible" : "hidden",
                        background: "#FFFFFF"
                    }}
                />
            </Box>
            <Typography>{secondaryText}</Typography>
        </Box>
    );
};

export default Consultation;
