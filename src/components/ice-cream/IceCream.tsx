import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";

import {
    Badge,
    Box,
    Fab,
    Grid,
    Link,
    Skeleton,
    Typography,
    useMediaQuery,
    useTheme,
    Zoom
} from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
import IcecreamOutlinedIcon from "@mui/icons-material/IcecreamOutlined";

import { useIceCreamCart } from "./IceCreamCartContext";
import { useAppContext } from "../AppContext";
import { useEffect } from "react";
import type { DatabaseFlavor } from "../../../api/types";
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

function getFlavorStyles(color: string, isSelected: boolean, isSmallScreen: boolean) {
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
}

function getUpcomingFlavorStyles() {
    return {
        border: 1,
        borderColor: "rgba(255, 255, 255, 0.5)",
        backgroundColor: "transparent",
        padding: 2.5,
        borderRadius: 1
    };
}

const IceCream = () => {
    const navigate = useNavigate();
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
    }, []);

    useEffect(() => {
        const flavorPriceId = params.get("flavor");
        if (!flavorPriceId) {
            return;
        }
        toggleFlavor(flavorPriceId);
        return () => {
            toggleFlavor(flavorPriceId);
        };
    }, [params]);

    const handleCartClick = () => {
        const priceIdsParam = selectedPriceIds.join(",");
        void navigate(`/ice-cream/checkout?priceIds=${priceIdsParam}`);
    };

    const mailingList = (
        <Typography mt={smallScreen ? 4 : -1}>
            Want to stay updated?{" "}
            <Link
                component={RouterLink}
                to="/ice-cream/mailing-list"
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
    );

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
            {!smallScreen && mailingList}
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
            {smallScreen && mailingList}
            {smallScreen && selectedPriceIds.length > 0 && (
                <Zoom
                    in={true}
                    timeout={theme.transitions.duration.enteringScreen}
                    style={{
                        transitionDelay: `${String(theme.transitions.duration.leavingScreen)}ms`
                    }}
                    unmountOnExit
                >
                    <Badge
                        badgeContent={selectedPriceIds.length}
                        overlap={"circular"}
                        sx={{
                            position: "fixed",
                            bottom: "calc(24px + env(safe-area-inset-bottom))",
                            right: 24,
                            "& .MuiBadge-badge": {
                                top: 6,
                                right: 6,
                                minWidth: 24,
                                height: 24,
                                borderRadius: 12,
                                fontSize: 15,
                                fontWeight: 600,
                                backgroundColor: "#F9F9F9",
                                color: "#121212",
                                border: "2px solid #121212",
                                zIndex: theme.zIndex.fab + 1
                            }
                        }}
                    >
                        <Fab
                            aria-label={`Checkout, ${String(selectedPriceIds.length)} in cart`}
                            onClick={handleCartClick}
                            sx={{
                                backgroundColor: "#52535F",
                                color: "white",
                                border: "1px solid rgba(255,255,255,0.5)",
                                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.5)",
                                ":hover": { backgroundColor: "#5F6272" }
                            }}
                        >
                            <IcecreamOutlinedIcon />
                        </Fab>
                    </Badge>
                </Zoom>
            )}
        </Box>
    );
};

type Cart = {
    selectedPriceIds: string[];
    toggleFlavor: (priceId: string | undefined) => void;
};

type FlavorSectionProps = {
    title: string;
    description: string;
    flavors: DatabaseFlavor[];
    isLoading: boolean;
    skeletons: number;
    cart?: Cart;
};

function FlavorSection(props: FlavorSectionProps) {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const { cart } = props;
    const shown = cart ? props.flavors.filter((flavor) => flavor.count > 0) : props.flavors;

    return (
        <Box display={"flex"} flexDirection={"column"} sx={{ paddingTop: smallScreen ? 4 : 2.5 }}>
            <Typography variant="h2">{props.title}</Typography>
            <Typography>{props.description}</Typography>
            <Grid
                container
                spacing={3}
                direction={smallScreen ? "column" : undefined}
                sx={{ paddingTop: smallScreen ? 4 : 2 }}
            >
                {props.isLoading
                    ? Array.from({ length: props.skeletons }, (_, i) => (
                          <Grid
                              key={i}
                              display={"flex"}
                              justifyContent={"center"}
                              sx={{ width: smallScreen ? "100%" : undefined }}
                          >
                              <Skeleton
                                  variant="rounded"
                                  width={smallScreen ? "100%" : 200 + Math.random() * 100}
                                  height={75}
                                  sx={{ borderRadius: 1 }}
                              />
                          </Grid>
                      ))
                    : shown.map((flavor) => {
                          const color = flavor.color || "white";
                          return (
                              <Grid
                                  key={flavor.productId}
                                  display={"flex"}
                                  justifyContent={"center"}
                                  sx={{ width: smallScreen ? "100%" : undefined }}
                              >
                                  <Box
                                      display={"flex"}
                                      onClick={
                                          cart
                                              ? () => {
                                                    cart.toggleFlavor(flavor.priceId);
                                                }
                                              : undefined
                                      }
                                      sx={{
                                          ...(cart
                                              ? getFlavorStyles(
                                                    color,
                                                    cart.selectedPriceIds.includes(flavor.priceId),
                                                    smallScreen
                                                )
                                              : getUpcomingFlavorStyles()),
                                          width: smallScreen ? "100%" : undefined,
                                          justifyContent: smallScreen ? "flex-start" : "center"
                                      }}
                                  >
                                      <Typography color={color}>{flavor.name}</Typography>
                                  </Box>
                              </Grid>
                          );
                      })}
            </Grid>
        </Box>
    );
}

export default IceCream;
