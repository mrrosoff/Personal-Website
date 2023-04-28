import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { ContactButtonList } from "../SocialButtons";

const Consultation = (_props: any) => {
    const [visibleCursor, setVisibleCursor] = useState<boolean>(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setVisibleCursor((visible) => !visible);
        }, 650);
        return () => clearInterval(interval);
    }, []);

    return (
        <Box display={"flex"} flexDirection={"column"}>
            <Box display={"flex"} alignItems={"center"} sx={{ height: 100 }}>
                <Typography style={{ fontSize: 80, fontWeight: 500 }}>Consulting</Typography>
                <Box
                    id={"cursor"}
                    ml={2}
                    width={18}
                    height={50}
                    sx={{ background: "#FFFFFF", visibility: visibleCursor ? "visible" : "hidden" }}
                />
            </Box>
            <Box mt={6}>
                <Typography style={{ fontSize: 30 }}>
                    Looking for something custom made? I might be able to bring your vision to life.
                </Typography>
            </Box>
            <Box display={"flex"} alignItems={"center"} sx={{ mt: 6 }}>
                <Typography>Hit Me Up Via</Typography>
                <ContactButtonList sx={{ p: 0, ml: 2 }} />
            </Box>
        </Box>
    );
};

export default Consultation;
