import { useNavigate } from "react-router-dom";

import { Box, Fab, Grid, Link, Typography, useMediaQuery, useTheme } from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import { ICE_CREAM_FLAVORS } from "./flavors";
import { useIceCreamCart } from "./IceCreamCartContext";

const getFlavorStyles = (color: string, isSelected: boolean) => {
    return {
        cursor: "pointer",
        border: 1,
        borderColor: isSelected ? color : "rgba(255, 255, 255, 0.5)",
        backgroundColor: isSelected ? `color-mix(in srgb, ${color} 8%, transparent)` : "transparent",
        padding: 2.5,
        borderRadius: 1,
        transition: "all 0.2s ease",
        "&:hover": {
            borderColor: color,
            backgroundColor: `color-mix(in srgb, ${color} 5%, transparent)`
        }
    };
};

const getUpcomingFlavorStyles = () => {
    return {
        border: 1,
        borderColor: "rgba(255, 255, 255, 0.5)",
        backgroundColor: "transparent",
        padding: 2.5,
        borderRadius: 1
    };
};

const IceCream = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const { selectedPriceIds, toggleFlavor } = useIceCreamCart();

    const handleCartClick = () => {
        const priceIdsParam = selectedPriceIds.join(",");
        navigate(`/ice-cream/checkout?priceIds=${priceIdsParam}`);
    };

    return (
        <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={smallScreen ? undefined : undefined}
            pb={smallScreen ? 10 : 4}
        >
            {smallScreen ? (
                <>
                    <Typography variant="h1" sx={{ lineHeight: 0.85 }}>Small Batch</Typography>
                    <Typography variant="h1" sx={{ ml: -0.5, lineHeight: 0.85 }}>Ice Cream</Typography>
                </>
            ) : (
                <Typography variant="h1">Small Batch Ice Cream</Typography>
            )}
            <Typography mt={smallScreen ? 2 : undefined}>
                Limited. High quality. San Francisco based. Creative flavors, priced at $5 per pint.
            </Typography>
            <Typography mt={smallScreen ? 0 : -1}>
                Want to stay updated?{" "}
                <Link
                    component="button"
                    onClick={() => navigate("/ice-cream/mailing-list")}
                    underline="hover"
                    sx={{
                        cursor: "pointer",
                        color: "inherit",
                        verticalAlign: "baseline",
                        position: "relative",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.3
                    }}
                >
                    Join our mailing list
                    <LaunchIcon sx={{ fontSize: 10, position: "relative", top: -4 }} />
                </Link>{" "}
                for new flavor announcements.
            </Typography>
            <CurrentFlavors selectedPriceIds={selectedPriceIds} toggleFlavor={toggleFlavor} />
            <LastBatch selectedPriceIds={selectedPriceIds} toggleFlavor={toggleFlavor} />
            <Schedule />
            {smallScreen && selectedPriceIds.length > 0 && (
                <Fab
                    color="primary"
                    onClick={handleCartClick}
                    sx={{
                        position: "fixed",
                        bottom: 24,
                        right: 24,
                        backgroundColor: "#52535F",
                        color: "white",
                        ":hover": { backgroundColor: "#5F6272" }
                    }}
                >
                    <ShoppingCartIcon />
                </Fab>
            )}
        </Box>
    );
};

type FlavorSectionProps = {
    selectedPriceIds: string[];
    toggleFlavor: (priceId: string | undefined) => void;
};

export const CurrentFlavors = ({ selectedPriceIds, toggleFlavor }: FlavorSectionProps) => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    return (
        <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={smallScreen ? undefined : undefined}
            sx={{ paddingTop: smallScreen ? 6 : 2.5 }}
        >
            <Typography variant="h2">Current Flavors</Typography>
            <Typography>Our current rotation of flavors.</Typography>
            <Grid
                container
                spacing={3}
                direction={smallScreen ? "column" : undefined}
                sx={{ paddingTop: smallScreen ? 4 : 2 }}
            >
                {ICE_CREAM_FLAVORS.currentFlavors.map((flavor, index) => {
                    const isSelected = flavor.priceId
                        ? selectedPriceIds.includes(flavor.priceId)
                        : false;
                    const flavorStyles = getFlavorStyles(flavor.color || "white", isSelected);
                    return (
                        <Grid
                            key={index}
                            display={"flex"}
                            justifyContent={"center"}
                            sx={{ width: smallScreen ? "100%" : undefined }}
                        >
                            <Box
                                display={"flex"}
                                onClick={() => toggleFlavor(flavor.priceId)}
                                sx={{
                                    ...flavorStyles,
                                    width: smallScreen ? "100%" : undefined,
                                    justifyContent: smallScreen ? "flex-start" : "center"
                                }}
                            >
                                <Typography color={flavor.color || "white"}>
                                    {flavor.name}
                                </Typography>
                            </Box>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

export const LastBatch = ({ selectedPriceIds, toggleFlavor }: FlavorSectionProps) => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    return (
        <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={smallScreen ? undefined : undefined}
            sx={{ paddingTop: smallScreen ? 6 : 2.5 }}
        >
            <Typography variant="h2">Last Batch</Typography>
            <Typography>Get them before they are gone! Limited quantities available.</Typography>
            <Grid
                container
                spacing={3}
                direction={smallScreen ? "column" : undefined}
                sx={{ paddingTop: smallScreen ? 4 : 2 }}
            >
                {ICE_CREAM_FLAVORS.lastBatch.map((flavor, index) => {
                    const isSelected = flavor.priceId
                        ? selectedPriceIds.includes(flavor.priceId)
                        : false;
                    const flavorStyles = getFlavorStyles(flavor.color || "white", isSelected);
                    return (
                        <Grid
                            key={index}
                            display={"flex"}
                            justifyContent={"center"}
                            sx={{ width: smallScreen ? "100%" : undefined }}
                        >
                            <Box
                                display={"flex"}
                                onClick={() => toggleFlavor(flavor.priceId)}
                                sx={{
                                    ...flavorStyles,
                                    width: smallScreen ? "100%" : undefined,
                                    justifyContent: smallScreen ? "flex-start" : "center"
                                }}
                            >
                                <Typography color={flavor.color || "white"}>
                                    {flavor.name}
                                </Typography>
                            </Box>
                        </Grid>
                    );
                })}
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
            alignItems={smallScreen ? undefined : undefined}
            sx={{ paddingTop: smallScreen ? 6 : 2.5 }}
        >
            <Typography variant="h2">Whats Coming Up...</Typography>
            <Typography>
                The following is a list of possible upcoming flavors. Actual availability may vary
                by seasonal produce and other factors.
            </Typography>
            <Grid
                container
                spacing={3}
                direction={smallScreen ? "column" : undefined}
                sx={{ paddingTop: smallScreen ? 4 : 2 }}
            >
                {ICE_CREAM_FLAVORS.upcomingFlavors.map((flavor, index) => {
                    const upcomingStyles = getUpcomingFlavorStyles();
                    return (
                        <Grid
                            key={index}
                            display={"flex"}
                            justifyContent={"center"}
                            sx={{ width: smallScreen ? "100%" : undefined }}
                        >
                            <Box
                                display={"flex"}
                                sx={{
                                    ...upcomingStyles,
                                    width: smallScreen ? "100%" : undefined,
                                    justifyContent: smallScreen ? "flex-start" : "center"
                                }}
                            >
                                <Typography color={flavor.color || "white"}>{flavor.name}</Typography>
                            </Box>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

export default IceCream;
