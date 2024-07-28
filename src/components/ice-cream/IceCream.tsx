import { Box, Grid, Typography } from "@mui/material";

import Peaches from "../../assets/images/peaches.png";
import Brownie from "../../assets/images/brownie.png";
import Mango from "../../assets/images/mango.png";
import LemonLime from "../../assets/images/lemon-lime.png";
import Strawberry from "../../assets/images/strawberry.png";

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
            <Grid container spacing={3} sx={{ paddingTop: 2 }}>
                <Grid item>
                    <Box display={"flex"} sx={{ border: 1, padding: 2 }}>
                        <Typography sx={{ pr: 3 }}>???</Typography>
                        <Typography variant={"h4"} align={"center"} sx={{ pr: 3 }}>
                            Mystery
                        </Typography>
                        <Typography>???</Typography>
                    </Box>
                </Grid>
                <Grid item>
                    <Box display={"flex"} sx={{ border: 1, padding: 2 }}>
                        <Typography variant={"h4"} color={"orange"} sx={{ pr: 2 }}>
                            Peaches
                        </Typography>
                        <img src={Peaches} alt={"Peaches"} style={{ width: 50 }} />
                    </Box>
                </Grid>
                <Grid item>
                    <Box display={"flex"} sx={{ border: 1, padding: 2 }}>
                        <Typography variant={"h4"} color={"#54240A"} sx={{ pr: 2 }}>
                            Gooey Brownie
                        </Typography>
                        <img src={Brownie} alt={"Brownie"} style={{ width: 45 }} />
                    </Box>
                </Grid>
                <Grid item>
                    <Box display={"flex"} sx={{ border: 1, padding: 2 }}>
                        <Typography variant={"h4"} color={"orange"} sx={{ pr: 2 }}>
                            Mango
                        </Typography>
                        <img src={Mango} alt={"Mango"} style={{ width: 40, marginBottom: -5 }} />
                    </Box>
                </Grid>
                <Grid item>
                    <Box display={"flex"} sx={{ border: 1, padding: 2 }}>
                        <Typography variant={"h4"} color={"yellow"} sx={{ pr: 2 }}>
                            Lemon Lime
                        </Typography>
                        <img src={LemonLime} alt={"LemonLime"} style={{ width: 50 }} />
                    </Box>
                </Grid>
                <Grid item>
                    <Box display={"flex"} sx={{ border: 1, padding: 2 }}>
                        <Typography variant={"h4"} color={"red"} sx={{ pr: 2 }}>
                            Strawberry
                        </Typography>
                        <img src={Strawberry} alt={"LemonLime"} style={{ width: 50 }} />
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
            <Grid container spacing={3} sx={{ paddingTop: 2 }}>
                <Grid item>
                    <Box display={"flex"} sx={{ border: 1, padding: 2 }}>
                        <Typography align={"center"} color={"purple"}>
                            Honey Lavender
                        </Typography>
                    </Box>
                </Grid>
                <Grid item>
                    <Box display={"flex"} sx={{ border: 1, padding: 2 }}>
                        <Typography align={"center"} color={"pink"}>
                            Rose Saffron
                        </Typography>
                    </Box>
                </Grid>
                <Grid item>
                    <Box display={"flex"} sx={{ border: 1, padding: 2 }}>
                        <Typography align={"center"} color={"#0096FF"}>
                            Blueberry
                        </Typography>
                        <Typography sx={{ paddingLeft: 1 }} align={"center"} color={"green"}>
                            Matcha
                        </Typography>
                    </Box>
                </Grid>
                <Grid item>
                    <Box display={"flex"} sx={{ border: 1, padding: 2 }}>
                        <Typography align={"center"} color={"grey"}>
                            Black Sesame
                        </Typography>
                    </Box>
                </Grid>
                <Grid item>
                    <Box display={"flex"} sx={{ border: 1, padding: 2 }}>
                        <Typography align={"center"} color={"brown"}>
                            Mexican Hot Chocolate
                        </Typography>
                    </Box>
                </Grid>
                <Grid item>
                    <Box display={"flex"} sx={{ border: 1, padding: 2 }}>
                        <Typography align={"center"} color={"purple"}>
                            Taro
                        </Typography>
                    </Box>
                </Grid>
                <Grid item>
                    <Box display={"flex"} sx={{ border: 1, padding: 2 }}>
                        <Typography align={"center"} color={"greenyellow"}>
                            Pandan
                        </Typography>
                    </Box>
                </Grid>
                <Grid item>
                    <Box display={"flex"} sx={{ border: 1, padding: 2 }}>
                        <Typography align={"center"}>Chestnut</Typography>
                    </Box>
                </Grid>
                <Grid item>
                    <Box display={"flex"} sx={{ border: 1, padding: 2 }}>
                        <Typography align={"center"}>???</Typography>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default IceCream;
