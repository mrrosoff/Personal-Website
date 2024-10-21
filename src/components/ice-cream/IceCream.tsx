import { Box, Grid2 as Grid, Typography } from "@mui/material";

import Peaches from "../../assets/images/peaches.png";

const IceCream = () => {
    return (
        <Box id={"ice-cream"}>
            <Typography variant="h1" sx={{ maxWidth: { lg: 800, xs: 400 } }}>
                Small Batch Ice Cream
            </Typography>
            <Typography>
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
    return (
        <Box sx={{ paddingTop: 3 }}>
            <Typography variant="h2">Current Flavors</Typography>
            <Typography>Our current rotation of flavors.</Typography>
            <Grid container spacing={3} sx={{ paddingTop: 2 }}>
                <Grid>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"gold"}>
                            🍫 Chocolate Waffle 🧇
                        </Typography>
                    </Box>
                </Grid>
                <Grid>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"grey"}>
                            👻 Ghostly Presence 😱
                        </Typography>
                    </Box>
                </Grid>
                <Grid>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"lightgreen"}>
                            🍏 Caramel Apple 🍎
                        </Typography>
                    </Box>
                </Grid>
                <Grid>
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
    return (
        <Box sx={{ paddingTop: 3 }}>
            <Typography variant="h2">Last Batch</Typography>
            <Typography>Get them before they are gone! Limited quantities available.</Typography>
            <Grid container spacing={3} sx={{ paddingTop: 2 }}>
                <Grid>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"orange"}>
                            🍑 Peaches 🍑
                        </Typography>
                    </Box>
                </Grid>
                <Grid>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"#CF9FFF"}>
                            🍯 Honey Lavender 🪻
                        </Typography>
                    </Box>
                </Grid>
                <Grid>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"white"}>
                            🧀 Goat Cheese +
                        </Typography>
                        <Typography sx={{ paddingLeft: 1 }} align={"center"} color={"blue"}>
                            Blueberry Habanero 🫐 🌶️
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export const Schedule = () => {
    return (
        <Box sx={{ paddingTop: 3 }}>
            <Typography variant="h2">Whats Coming Up...</Typography>
            <Typography>
                The following is a list of possible upcoming flavors. Actual availability may vary
                by seasonal produce and other factors.
            </Typography>
            <Grid container spacing={3} sx={{ paddingTop: 2 }}>
                <Grid>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"pink"}>
                            🌹 Rose Saffron
                        </Typography>
                    </Box>
                </Grid>
                <Grid>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"grey"}>
                            Black Sesame
                        </Typography>
                    </Box>
                </Grid>
                <Grid>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"brown"}>
                            Mexican Hot Chocolate ☕
                        </Typography>
                    </Box>
                </Grid>
                <Grid>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"green"}>
                            Lychee
                        </Typography>
                    </Box>
                </Grid>
                <Grid>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"greenyellow"}>
                            🌿 Pandan
                        </Typography>
                    </Box>
                </Grid>
                <Grid>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"}>Black Milk Tea Boba 🧋</Typography>
                    </Box>
                </Grid>
                <Grid>
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
