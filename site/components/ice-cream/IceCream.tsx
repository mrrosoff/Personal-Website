import { Link as RouterLink, useSearchParams } from "react-router-dom";

import { Box, Link, Typography, useMediaQuery, useTheme } from "@mui/material";

import { useIceCreamCart } from "./IceCreamCartContext";
import CartButton from "./IceCream/CartButton";
import FlavorSection from "./IceCream/FlavorSection";
import MailingListLink from "./IceCream/MailingListLink";
import { useAppContext } from "../AppContext";
import { useEffect } from "react";
import { TERMINAL_COLORS } from "../terminal/Terminal";

export const rainbowTextSx = {
    background:
        "linear-gradient(90deg, #ff0000, #ff9a00, #d0de21, #4fdc4a, #3fdad8, #2fc9e2, #1c7fee, #5f15f2, #ba0cf8, #fb07d9, #ff0000)",
    backgroundSize: "200% 100%",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    color: "transparent",
    animation: "friendRainbow 3s linear infinite",
    "@keyframes friendRainbow": {
        "0%": { backgroundPosition: "200% 50%" },
        "100%": { backgroundPosition: "0% 50%" }
    }
} as const;

const IceCream = () => {
    const [params] = useSearchParams();
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const {
        selectedPriceIds,
        isLoadingFlavors,
        flavors,
        flavorsError,
        refreshFlavors,
        toggleFlavor
    } = useIceCreamCart();
    const { friendToken } = useAppContext();
    const showSkeletons = isLoadingFlavors && flavors.length === 0;

    useEffect(() => {
        void refreshFlavors();
    }, [refreshFlavors]);

    useEffect(() => {
        const flavorPriceId = params.get("flavor");
        if (!flavorPriceId) {
            return;
        }
        toggleFlavor(flavorPriceId);
        return () => toggleFlavor(flavorPriceId);
    }, [params, toggleFlavor]);

    return (
        <Box display={"flex"} flexDirection={"column"} pb={4}>
            <Typography variant="h1">Max's Freezer Stash</Typography>
            <Typography mt={smallScreen ? 2 : undefined}>
                High quality. Small batch. Creative flavors{" "}
                {friendToken ? (
                    <Typography component={"span"} sx={{ fontSize: "inherit", ...rainbowTextSx }}>
                        on the house for friends of Max.
                    </Typography>
                ) : (
                    <>
                        priced at $6 per pint, or{" "}
                        <Link
                            component={RouterLink}
                            to="/ice-cream/checkout?subscription=true"
                            underline="hover"
                            sx={{
                                cursor: "pointer",
                                color: "inherit",
                                fontSize: "inherit",
                                verticalAlign: "baseline"
                            }}
                        >
                            $10 for two every month
                        </Link>
                        .
                    </>
                )}
            </Typography>
            <Typography mt={smallScreen ? 2 : -1}>
                In SF? Come stop by! Outside SF? Don't buy anything you can't carry home.
            </Typography>
            {!smallScreen && <MailingListLink />}
            {flavorsError && (
                <Typography mt={3}>
                    Checking Freezer Stash . . . . . .
                    <span style={{ color: TERMINAL_COLORS.errorColor }}> FAILED</span>
                </Typography>
            )}
            <FlavorSection
                title={"Current Flavors"}
                description={"Our current rotation of flavors."}
                flavors={flavors.filter((f) => f.type === "currentFlavor")}
                isLoading={showSkeletons}
                skeletons={3}
                cart={{ selectedPriceIds, toggleFlavor }}
            />
            <FlavorSection
                title={"Last Batch"}
                description={"Get them before they are gone! Limited quantities available."}
                flavors={flavors.filter((f) => f.type === "lastBatch")}
                isLoading={showSkeletons}
                skeletons={2}
                cart={{ selectedPriceIds, toggleFlavor }}
            />
            <FlavorSection
                title={"Whats Coming Up..."}
                description={
                    "The following is a list of possible upcoming flavors. Actual availability may vary by seasonal produce and other factors."
                }
                flavors={flavors.filter((f) => f.type === "upcoming")}
                isLoading={showSkeletons}
                skeletons={4}
            />
            {smallScreen && <MailingListLink />}
            {smallScreen && selectedPriceIds.length > 0 && <CartButton />}
        </Box>
    );
};

export default IceCream;
