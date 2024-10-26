import { Box, Grid2 as Grid, Typography, useMediaQuery, useTheme } from "@mui/material";

const IceCream = () => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    return (
        <Box
            id={"ice-cream"}
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
                Limited. High quality. Seattle based. Creative flavors, priced at $5 per pint.
                Contact me on any platform to order.
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
            sx={{ paddingTop: smallScreen ? 6 : 3 }}
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
                <Grid display={"flex"} justifyContent={"center"}>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"gold"}>
                            🍫 Chocolate Waffle 🧇
                        </Typography>
                    </Box>
                </Grid>
                <Grid display={"flex"} justifyContent={"center"}>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"grey"}>
                            👻 Ghostly Presence 😱
                        </Typography>
                    </Box>
                </Grid>
                <Grid display={"flex"} justifyContent={"center"}>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"lightgreen"}>
                            🍏 Caramel Apple 🍎
                        </Typography>
                    </Box>
                </Grid>
                <Grid display={"flex"} justifyContent={"center"}>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"maroon"}>
                            ❤️ Love Potion 💖
                        </Typography>
                    </Box>
                </Grid>
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
            sx={{ paddingTop: smallScreen ? 6 : 3 }}
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
                <Grid display={"flex"} justifyContent={"center"}>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"orange"}>
                            🍑 Peaches 🍑
                        </Typography>
                    </Box>
                </Grid>
                <Grid display={"flex"} justifyContent={"center"}>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"#CF9FFF"}>
                            🍯 Honey Lavender 🪻
                        </Typography>
                    </Box>
                </Grid>
                <Grid display={"flex"} justifyContent={"center"}>
                    <Box
                        display={"flex"}
                        alignItems={"center"}
                        sx={{ border: 1, padding: 2.5, borderRadius: 1 }}
                    >
                        <Typography align={"center"} color={"white"}>
                            🧀 Goat Cheese +
                        </Typography>
                        <Typography sx={{ paddingLeft: 1 }} align={"center"} color={"blue"}>
                            Blueberry Habanero 🌶️
                        </Typography>
                    </Box>
                </Grid>
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
            sx={{ paddingTop: smallScreen ? 6 : 3 }}
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
                <Grid display={"flex"} justifyContent={"center"}>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"pink"}>
                            🌹 Rose Saffron
                        </Typography>
                    </Box>
                </Grid>
                <Grid display={"flex"} justifyContent={"center"}>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"grey"}>
                            Black Sesame
                        </Typography>
                    </Box>
                </Grid>
                <Grid display={"flex"} justifyContent={"center"}>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"brown"}>
                            Mexican Hot Chocolate ☕
                        </Typography>
                    </Box>
                </Grid>
                <Grid display={"flex"} justifyContent={"center"}>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"green"}>
                            Lychee
                        </Typography>
                    </Box>
                </Grid>
                <Grid display={"flex"} justifyContent={"center"}>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"greenyellow"}>
                            🌿 Pandan
                        </Typography>
                    </Box>
                </Grid>
                <Grid display={"flex"} justifyContent={"center"}>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"}>Black Milk Tea Boba 🧋</Typography>
                    </Box>
                </Grid>
                <Grid display={"flex"} justifyContent={"center"}>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"red"}>
                            Strawberry 🍓
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default IceCream;
