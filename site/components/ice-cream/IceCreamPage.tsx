import type { ReactNode } from "react";

import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";

type IceCreamPageProps = {
    title: string;
    subtitle: ReactNode;
    children: ReactNode;
};

const IceCreamPage = (props: IceCreamPageProps) => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    return (
        <Box
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"space-between"}
            alignItems={smallScreen ? "center" : undefined}
        >
            <Box
                display={"flex"}
                flexDirection={"column"}
                alignItems={smallScreen ? "center" : undefined}
                mb={smallScreen ? 4 : 6}
            >
                <Typography
                    variant="h1"
                    align={smallScreen ? "center" : undefined}
                    sx={{ maxWidth: smallScreen ? 300 : undefined }}
                >
                    {props.title}
                </Typography>
                <Typography
                    mt={smallScreen ? 1 : undefined}
                    align={smallScreen ? "center" : undefined}
                    sx={{ maxWidth: smallScreen ? 300 : undefined }}
                >
                    {props.subtitle}
                </Typography>
                {props.children}
            </Box>
            <Box height={smallScreen ? 150 : 250} overflow={"hidden"}>
                <img
                    src="/images/ice-cream.webp"
                    alt="Ice Cream"
                    width={smallScreen ? 150 : 250}
                    style={{ transform: "rotate(15deg)" }}
                />
            </Box>
        </Box>
    );
};

export default IceCreamPage;
