import { useNavigate, useSearchParams } from "react-router-dom";

import {
    Badge,
    Box,
    Collapse,
    Fab,
    Grid,
    Link,
    Typography,
    useMediaQuery,
    useTheme,
    Zoom
} from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";

import { useIceCreamCart } from "./IceCreamCartContext";
import { useEffect, useState } from "react";
import { API_URL } from "../App";
import axios from "axios";
import { DatabaseFlavor } from "../../../api/types";

const getFlavorStyles = (color: string, isSelected: boolean, isSmallScreen: boolean) => {
    return {
        cursor: "pointer",
        border: 1,
        borderColor: isSelected ? color : "rgba(255, 255, 255, 0.5)",
        backgroundColor: isSelected
            ? `color-mix(in srgb, ${color} 8%, transparent)`
            : "transparent",
        padding: 2.5,
        borderRadius: 1,
        transition: "all 0.2s ease",
        ...(!isSmallScreen && {
            "&:hover": {
                borderColor: color,
                backgroundColor: `color-mix(in srgb, ${color} 5%, transparent)`
            }
        })
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
    const [params, _] = useSearchParams();
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const { selectedPriceIds, toggleFlavor } = useIceCreamCart();
    const [flavors, setFlavors] = useState<DatabaseFlavor[]>([]);

    useEffect(() => {
        async function fetchInventory() {
            const { data } = await axios.post<{ inventory: DatabaseFlavor[] }>(
                `${API_URL}/inventory`
            );
            setFlavors(data.inventory);
        }
        void fetchInventory();
    }, []);

    useEffect(() => {
        const flavorPriceId = params.get("flavor");
        if (!flavorPriceId) {
            return;
        }
        toggleFlavor(flavorPriceId);
        return () => toggleFlavor(flavorPriceId);
    }, [params]);

    const handleCartClick = () => {
        const priceIdsParam = selectedPriceIds.join(",");
        navigate(`/ice-cream/checkout?priceIds=${priceIdsParam}`);
    };

    return (
        <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={smallScreen ? undefined : undefined}
            pb={4}
        >
            <Typography variant="h1">Max's Freezer Stash</Typography>
            <Typography mt={smallScreen ? 2 : undefined}>
                High quality. Small batch. San Francisco based creative flavors, priced at $5 per
                pint.
            </Typography>
            <Typography mt={smallScreen ? 2 : -1}>
                In SF? Come stop by! Outside SF? Don't buy anything you can't carry home.
            </Typography>
            <Typography mt={smallScreen ? 2 : -1}>
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
            <CurrentFlavors
                selectedPriceIds={selectedPriceIds}
                toggleFlavor={toggleFlavor}
                flavors={flavors.filter((f) => f.type === "currentFlavor")}
            />
            <LastBatch
                selectedPriceIds={selectedPriceIds}
                toggleFlavor={toggleFlavor}
                flavors={flavors.filter((f) => f.type === "lastBatch")}
            />
            <Schedule flavors={flavors.filter((f) => f.type === "upcoming")} />
            {smallScreen && selectedPriceIds.length > 0 && (
                <Zoom
                    in={true}
                    timeout={theme.transitions.duration.enteringScreen}
                    style={{
                        transitionDelay: `${theme.transitions.duration.leavingScreen}ms`
                    }}
                    unmountOnExit
                >
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
                        <Badge badgeContent={selectedPriceIds.length} sx={{ p: 0.25 }}>
                            <ShoppingCartOutlinedIcon sx={{ ml: -0.4, mb: -0.4 }} />
                        </Badge>
                    </Fab>
                </Zoom>
            )}
        </Box>
    );
};

export const CurrentFlavors = (props: {
    selectedPriceIds: string[];
    toggleFlavor: (priceId: string | undefined) => void;
    flavors: DatabaseFlavor[];
}) => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={smallScreen ? undefined : undefined}
            sx={{ paddingTop: smallScreen ? 4 : 2.5 }}
        >
            <Typography variant="h2">Current Flavors</Typography>
            <Typography>Our current rotation of flavors.</Typography>
            <Grid
                container
                spacing={3}
                direction={smallScreen ? "column" : undefined}
                sx={{ paddingTop: smallScreen ? 4 : 2 }}
            >
                {props.flavors.map((flavor) => {
                    const isSelected = props.selectedPriceIds.includes(flavor.priceId);
                    const flavorStyles = getFlavorStyles(
                        flavor.color || "white",
                        isSelected,
                        smallScreen
                    );
                    return (
                        <Collapse key={flavor.productId} in={flavor.count > 0} timeout={300}>
                            <Grid
                                display={"flex"}
                                justifyContent={"center"}
                                sx={{ width: smallScreen ? "100%" : undefined }}
                            >
                                <Box
                                    display={"flex"}
                                    onClick={() => props.toggleFlavor(flavor.priceId)}
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
                        </Collapse>
                    );
                })}
            </Grid>
        </Box>
    );
};

export const LastBatch = (props: {
    selectedPriceIds: string[];
    toggleFlavor: (priceId: string | undefined) => void;
    flavors: DatabaseFlavor[];
}) => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={smallScreen ? undefined : undefined}
            sx={{ paddingTop: smallScreen ? 4 : 2.5 }}
        >
            <Typography variant="h2">Last Batch</Typography>
            <Typography>Get them before they are gone! Limited quantities available.</Typography>
            <Grid
                container
                spacing={3}
                direction={smallScreen ? "column" : undefined}
                sx={{ paddingTop: smallScreen ? 4 : 2 }}
            >
                {props.flavors.map((flavor) => {
                    const isSelected = props.selectedPriceIds.includes(flavor.priceId);
                    const flavorStyles = getFlavorStyles(
                        flavor.color || "white",
                        isSelected,
                        smallScreen
                    );
                    return (
                        <Collapse key={flavor.productId} in={flavor.count > 0} timeout={300}>
                            <Grid
                                display={"flex"}
                                justifyContent={"center"}
                                sx={{ width: smallScreen ? "100%" : undefined }}
                            >
                                <Box
                                    display={"flex"}
                                    onClick={() => props.toggleFlavor(flavor.priceId)}
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
                        </Collapse>
                    );
                })}
            </Grid>
        </Box>
    );
};

export const Schedule = (props: { flavors: DatabaseFlavor[] }) => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    return (
        <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={smallScreen ? undefined : undefined}
            sx={{ paddingTop: smallScreen ? 4 : 2.5 }}
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
                {props.flavors.map((flavor, index) => {
                    const upcomingStyles = getUpcomingFlavorStyles();
                    return (
                        <Grid
                            key={flavor.productId}
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

export default IceCream;
