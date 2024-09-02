import { Box, Grid, Typography } from "@mui/material";

import Peaches from "../../assets/images/peaches.png";

const IceCream = () => {
    return (
        <Box id={"ice-cream"}>
            <Typography variant="h1" sx={{ maxWidth: { lg: 800, xs: 400 } }}>
                Small Batch Ice Cream
            </Typography>
            <Typography sx={{ paddingTop: 1.5 }}>
                Limited. High quality. Seattle based. Creative flavors, priced at $5 per pint.
            </Typography>
            <Typography>Contact me on any platform to order.</Typography>
            <CurrentFlavors />
            <Schedule />
        </Box>
    );
};

export const CurrentFlavors = () => {
    return (
        <Box>
            <Typography sx={{ paddingTop: 5 }} variant="h2">
                Current Flavors
            </Typography>
            <Grid container spacing={3} sx={{ paddingTop: 3 }}>
                <Grid item>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"#CF9FFF"}>
                            Honey Lavender
                        </Typography>
                    </Box>
                </Grid>
                <Grid item>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"yellow"}>
                            Lemon Lime
                        </Typography>
                    </Box>
                </Grid>
                <Grid item>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"orange"} sx={{ pr: 2 }}>
                            Peaches
                        </Typography>
                        <img src={Peaches} alt={"Peaches"} style={{ width: 50 }} />
                    </Box>
                </Grid>
                <Grid item>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography sx={{ pr: 3 }}>???</Typography>
                        <Typography align={"center"} sx={{ pr: 3 }}>
                            Mystery
                        </Typography>
                        <Typography>???</Typography>
                    </Box>
                </Grid>

                <Grid item>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"#0096FF"}>
                            Blueberry
                        </Typography>
                        <Typography sx={{ paddingLeft: 1 }} align={"center"} color={"green"}>
                            Matcha
                        </Typography>
                    </Box>
                </Grid>
                <Grid item>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"white"}>
                            Goat Cheese +
                        </Typography>
                        <Typography sx={{ paddingLeft: 1 }} align={"center"} color={"blue"}>
                            Blueberry Habanero
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
            <Typography sx={{ paddingTop: 5 }} variant="h2">
                Whats Coming Up...
            </Typography>
            <Typography>
                The following is a list of possible upcoming flavors. Actual availability may vary
                by seasonal produce and other factors.
            </Typography>
            <Grid container spacing={3} sx={{ paddingTop: 3 }}>
                <Grid item>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"pink"}>
                            Rose Saffron
                        </Typography>
                    </Box>
                </Grid>
                <Grid item>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"grey"}>
                            Black Sesame
                        </Typography>
                    </Box>
                </Grid>
                <Grid item>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"brown"}>
                            Mexican Hot Chocolate
                        </Typography>
                    </Box>
                </Grid>
                <Grid item>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"purple"}>
                            Taro
                        </Typography>
                    </Box>
                </Grid>
                <Grid item>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"greenyellow"}>
                            Pandan
                        </Typography>
                    </Box>
                </Grid>
                <Grid item>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"}>Chestnut</Typography>
                    </Box>
                </Grid>
                <Grid item>
                    <Box display={"flex"} sx={{ border: 1, padding: 2.5, borderRadius: 1 }}>
                        <Typography align={"center"} color={"red"}>
                            Strawberry
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default IceCream;
