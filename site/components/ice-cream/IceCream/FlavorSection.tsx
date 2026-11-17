import { useState } from "react";
import { Box, Grid, Skeleton, Typography, useMediaQuery, useTheme } from "@mui/material";

import type { DatabaseFlavor } from "../../../../api/types";
import { COLORS } from "../../../theme";

function getFlavorStyles(color: string, isSelected: boolean, isSmallScreen: boolean) {
    return {
        cursor: "pointer",
        border: 1,
        borderColor: isSelected ? color : COLORS.muted,
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
        borderColor: COLORS.muted,
        backgroundColor: "transparent",
        padding: 2.5,
        borderRadius: 1
    };
}

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

export default function FlavorSection(props: FlavorSectionProps) {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const { cart } = props;
    const shown = cart ? props.flavors.filter((flavor) => flavor.count > 0) : props.flavors;
    const [skeletonWidths] = useState(() =>
        Array.from({ length: props.skeletons }, () => 200 + Math.random() * 100)
    );

    return (
        <Box sx={{ display: "flex", flexDirection: "column", paddingTop: smallScreen ? 4 : 2.5 }}>
            <Typography variant="h2">{props.title}</Typography>
            <Typography>{props.description}</Typography>
            <Grid
                container
                spacing={3}
                sx={{
                    flexDirection: smallScreen ? "column" : "row",
                    paddingTop: smallScreen ? 4 : 2
                }}
            >
                {props.isLoading
                    ? skeletonWidths.map((width, i) => (
                          <Grid
                              key={i}
                              sx={{
                                  display: "flex",
                                  justifyContent: "center",
                                  width: smallScreen ? "100%" : undefined
                              }}
                          >
                              <Skeleton
                                  variant="rounded"
                                  width={smallScreen ? "100%" : width}
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
                                  sx={{
                                      display: "flex",
                                      justifyContent: "center",
                                      width: smallScreen ? "100%" : undefined
                                  }}
                              >
                                  <Box
                                      onClick={
                                          cart ? () => cart.toggleFlavor(flavor.priceId) : undefined
                                      }
                                      sx={{
                                          display: "flex",
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
                                      <Typography sx={{ color }}>{flavor.name}</Typography>
                                  </Box>
                              </Grid>
                          );
                      })}
            </Grid>
        </Box>
    );
}
