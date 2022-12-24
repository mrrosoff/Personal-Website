import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const Consultation = (props: any) => {
    const [mainText, setMainText] = useState<string>("");
    const [secondaryText, setSecondaryText] = useState<string>("");

    useEffect(() => {
        // set up text to print, each item in array is new line
        const fullMainText = "Consulting";
        const fullSecondaryText =
            "If you have a need for any variety of tech services, I could be your solution.";

        const typingSpeed = 250;
        const secondaryTextDelay = 5000;

        const mainTextInterval = setInterval(() => {
            const fullMainIndex = fullMainText.indexOf(mainText) || 0 + mainText.length + 1;
            console.log(mainText, fullMainIndex)
            if (fullMainIndex > fullMainText.length) {
                clearInterval(mainTextInterval);
            }
            setMainText(mainText + fullMainText[fullMainIndex]);
        }, typingSpeed);

        const secondaryTextTimeout = setTimeout(() => {
            const secondaryTextInterval = setInterval(() => {
                const fullSecondaryIndex =
                    fullSecondaryText.indexOf(mainText) + mainText.length + 1;
                if (fullSecondaryIndex > fullSecondaryText.length) {
                    clearInterval(secondaryTextInterval);
                }
                setSecondaryText(mainText + fullSecondaryText[fullSecondaryIndex]);
            }, typingSpeed);
        }, secondaryTextDelay);

        return () => {
            clearTimeout(secondaryTextTimeout);
            clearInterval(mainTextInterval);
        };
    }, []);

    return (
        <Box>
            <Typography>{mainText}</Typography>
            <Typography>{secondaryText}</Typography>
        </Box>
    );
};

export default Consultation;
