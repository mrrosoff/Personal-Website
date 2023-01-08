import { Box, Skeleton, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { DesktopSocialButtonList } from "../SocialButtons";

const Consultation = (_props: any) => {
    const [mainText, setMainText] = useState<string>("");
    const [secondaryText, setSecondaryText] = useState<string>("");

    const [visibleCursor, setVisibleCursor] = useState<boolean>(true);
    const [mainActiveCursor, setMainActiveCursor] = useState<boolean>(true);

    const [skeletonElements, setSkeletonElements] = useState<any[]>([]);

    const typingSpeed = 100;
    const startDelay = 800;
    const intermissionDelay = 1000;
    const secondStartDelay = 4000;
    const blinkInProjectsDelay = 6500;

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
                "I provide a variety of consulting services, for a technical project of any scale. Contact me using the links below for more information.";
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

    useEffect(() => {
        const timeout = setTimeout(() => {
            let i = 0;
            const interval = setInterval(() => {
                console.log(i);
                setSkeletonElements((skeletonElements) => [
                    ...skeletonElements,
                    <Skeleton
                        key={i}
                        variant="rectangular"
                        width={500}
                        height={500}
                        sx={{ ml: 4 }}
                    />
                ]);
                i++;
                if (i > 3) {
                    clearInterval(interval);
                }
            }, 350);
        }, blinkInProjectsDelay);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <Box display={"flex"} flexDirection={"column"}>
            <Box display={"flex"} alignItems={"center"} sx={{ height: 250 }}>
                <Typography style={{ fontSize: 150, fontWeight: 500 }}>{mainText}</Typography>
                <Box
                    id={"cursor"}
                    ml={mainText ? 2 : 0}
                    width={45}
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
            <Box display={"flex"} alignItems={"center"} sx={{ ml: -4, mt: -2 }}>
                {skeletonElements}
            </Box>
            <Box display={"flex"} alignItems={"center"} sx={{ ml: -2, mt: 6 }}>
                <DesktopSocialButtonList sx={{ p: 0 }} />
            </Box>
        </Box>
    );
};

export default Consultation;
