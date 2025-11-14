import { useNavigate } from "react-router-dom";

import { Box, Grid, Link, Typography, useMediaQuery, useTheme } from "@mui/material";
import { keyframes } from "@mui/system";

import { ICE_CREAM_FLAVORS } from "./flavors";

const createSparkleAnimation = (color: string) => keyframes`
    0%, 100% {
        box-shadow: 2px -2px 4px color-mix(in srgb, ${color} 70%, transparent);
    }
    25% {
        box-shadow: 2px 2px 4px color-mix(in srgb, ${color} 70%, transparent);
    }
    50% {
        box-shadow: -2px 2px 4px color-mix(in srgb, ${color} 70%, transparent);
    }
    75% {
        box-shadow: -2px -2px 4px color-mix(in srgb, ${color} 70%, transparent);
    }
`;

const getSparkleStyles = (color: string, index: number) => {
    const sparkleAnimation = createSparkleAnimation(color);
    const delay = -(index * 0.37); // Negative delay to start at different points
    return {
        position: "relative",
        "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 1,
            pointerEvents: "none",
            animation: `${sparkleAnimation} 4s ease-in-out infinite ${delay}s`
        }
    };
};

const IceCream = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    return (
        <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={smallScreen ? "center" : undefined}
        >
            <Typography
                variant="h1"
                align={smallScreen ? "center" : undefined}
                sx={{ maxWidth: smallScreen ? 300 : undefined }}
            >
                Small Batch Ice Cream
            </Typography>
            <Typography mt={smallScreen ? 1 : undefined} align={smallScreen ? "center" : undefined}>
                Limited. High quality. San Francisco based. Creative flavors, priced at $5 per pint.
            </Typography>
            <Typography mt={smallScreen ? 0 : -1} align={smallScreen ? "center" : undefined}>
                Contact me to order, or{" "}
                <Link
                    component="button"
                    onClick={() => navigate("/ice-cream/mailing-list")}
                    underline="hover"
                    sx={{ cursor: "pointer", color: "inherit", verticalAlign: "baseline" }}
                >
                    add yourself to the mailing list
                </Link>
                .
            </Typography>
            <CurrentFlavors />
            <LastBatch />
            <Schedule />
        </Box>
    );
};

export const CurrentFlavors = () => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    return (
        <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={smallScreen ? "center" : undefined}
            sx={{ paddingTop: smallScreen ? 6 : 2.5 }}
        >
            <Typography variant="h2">Current Flavors</Typography>
            <Typography align={smallScreen ? "center" : undefined}>
                Our current rotation of flavors.
            </Typography>
            <Grid
                container
                spacing={3}
                direction={smallScreen ? "column" : undefined}
                sx={{ paddingTop: smallScreen ? 4 : 2 }}
            >
                {ICE_CREAM_FLAVORS.currentFlavors.map((flavor, index) => (
                    <Grid key={index} display={"flex"} justifyContent={"center"}>
                        <Box
                            display={"flex"}
                            sx={{
                                border: 1,
                                padding: 2.5,
                                borderRadius: 1,
                                ...(flavor.sparkle &&
                                    getSparkleStyles(flavor.color || "white", index))
                            }}
                        >
                            <Typography align={"center"} color={flavor.color || "white"}>
                                {flavor.name}
                            </Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export const LastBatch = () => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    return (
        <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={smallScreen ? "center" : undefined}
            sx={{ paddingTop: smallScreen ? 6 : 2.5 }}
        >
            <Typography variant="h2">Last Batch</Typography>
            <Typography align={smallScreen ? "center" : undefined}>
                Get them before they are gone! Limited quantities available.
            </Typography>
            <Grid
                container
                spacing={3}
                direction={smallScreen ? "column" : undefined}
                sx={{ paddingTop: smallScreen ? 4 : 2 }}
            >
                {ICE_CREAM_FLAVORS.lastBatch.map((flavor, index) => (
                    <Grid key={index} display={"flex"} justifyContent={"center"}>
                        <Box
                            display={"flex"}
                            sx={{
                                border: 1,
                                padding: 2.5,
                                borderRadius: 1,
                                ...(flavor.sparkle &&
                                    getSparkleStyles(flavor.color || "white", index))
                            }}
                        >
                            <Typography align={"center"} color={flavor.color || "white"}>
                                {flavor.name}
                            </Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export const Schedule = () => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    return (
        <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={smallScreen ? "center" : undefined}
            sx={{ paddingTop: smallScreen ? 6 : 2.5 }}
        >
            <Typography variant="h2">Whats Coming Up...</Typography>
            <Typography align={smallScreen ? "center" : undefined}>
                The following is a list of possible upcoming flavors. Actual availability may vary
                by seasonal produce and other factors.
            </Typography>
            <Grid
                container
                spacing={3}
                direction={smallScreen ? "column" : undefined}
                sx={{ paddingTop: smallScreen ? 4 : 2 }}
            >
                {ICE_CREAM_FLAVORS.upcomingFlavors.map((flavor, index) => (
                    <Grid key={index} display={"flex"} justifyContent={"center"}>
                        <Box
                            display={"flex"}
                            sx={{
                                border: 1,
                                padding: 2.5,
                                borderRadius: 1,
                                ...(flavor.sparkle &&
                                    getSparkleStyles(flavor.color || "white", index))
                            }}
                        >
                            <Typography align={"center"} color={flavor.color || "white"}>
                                {flavor.name}
                            </Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default IceCream;
