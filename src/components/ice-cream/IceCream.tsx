import { Box, Grid, Typography } from "@mui/material";

import Peaches from "../../assets/images/peaches.png";
import Brownie from "../../assets/images/brownie.png";

const IceCream = () => {
    return (
        <Box id={"ice-cream"}>
            <Typography variant="h1" sx={{ maxWidth: { lg: 800, xs: 400 } }}>
                Max and Josette's Ice Cream Factory
            </Typography>
            <Typography sx={{ paddingTop: 1.5 }}>
                Limited, high quality, Seattle based small batch ice cream. Creative flavors, priced
                at $5 per pint.
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
                    <Box
                        width={500}
                        position={"relative"}
                        display={"flex"}
                        flexDirection={"column"}
                        sx={{ border: 1, padding: 2 }}
                    >
                        <Typography variant={"h4"} align={"center"}>
                            Mystery
                        </Typography>
                        <Typography align={"center"}>
                            Classic flavors, mystery ingredient. You may like it, or you may not...
                        </Typography>
                        <Typography sx={{ position: "absolute", top: 5, left: 20 }}>???</Typography>
                        <Typography sx={{ position: "absolute", top: 5, right: 20 }}>
                            ???
                        </Typography>
                        <Typography sx={{ position: "absolute", bottom: 5, left: 20 }}>
                            ???
                        </Typography>
                        <Typography sx={{ position: "absolute", bottom: 5, right: 20 }}>
                            ???
                        </Typography>
                    </Box>
                </Grid>
                <Grid item>
                    <Box
                        width={435}
                        display={"flex"}
                        flexDirection={"column"}
                        sx={{ border: 1, padding: 2 }}
                    >
                        <Box display={"flex"} justifyContent={"space-between"}>
                            <Typography variant={"h4"} color={"orange"}>
                                Peaches
                            </Typography>
                            <img src={Peaches} alt={"Peaches"} style={{ width: 50 }} />
                        </Box>
                        <Typography>A summer classic, good ole peaches and cream.</Typography>
                    </Box>
                </Grid>
                <Grid item>
                    <Box
                        width={350}
                        display={"flex"}
                        flexDirection={"column"}
                        sx={{ border: 1, padding: 2 }}
                    >
                        <Box display={"flex"} justifyContent={"space-between"}>
                            <Typography variant={"h4"} color={"#54240A"}>
                                Gooey Brownie
                            </Typography>
                            <img src={Brownie} alt={"Brownie"} style={{ width: 50 }} />
                        </Box>
                        <Typography>
                            Soft, gooey, fudgy brownie chunks in a rich chocolate base.
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export const Schedule = () => {
    return (
        <Box>
            <Typography sx={{ paddingTop: 5 }} variant="h2">
                Whats Coming Up...
            </Typography>
            <Typography>
                The following is a list of possible upcoming flavors. Actual availability may vary
                by seasonal produce and other factors.
            </Typography>
            <Box display={"flex"} alignItems={"center"} sx={{ paddingTop: 2 }}>
                <Box
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    sx={{
                        border: 1,
                        padding: 2,
                        marginRight: 1.5
                    }}
                >
                    <Typography align={"center"} color={"pink"}>
                        Rose Saffron
                    </Typography>
                </Box>
                <Box
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    sx={{
                        border: 1,
                        padding: 2,
                        margin: 1.5
                    }}
                >
                    <Typography align={"center"} color={"blue"}>
                        Blueberry
                    </Typography>
                    <Typography sx={{ paddingLeft: 1 }} align={"center"} color={"green"}>
                        Matcha
                    </Typography>
                </Box>
                <Box
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    sx={{
                        border: 1,
                        padding: 2,
                        marginLeft: 1.5,
                        marginRight: 1.5
                    }}
                >
                    <Typography align={"center"} color={"grey"}>
                        Black Sesame
                    </Typography>
                </Box>
                <Box
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    sx={{
                        border: 1,
                        padding: 2,
                        marginLeft: 1.5,
                        marginRight: 1.5
                    }}
                >
                    <Typography align={"center"} color={"brown"}>
                        Mexican Hot Chocolate
                    </Typography>
                </Box>
                <Box
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    sx={{
                        border: 1,
                        padding: 2,
                        marginLeft: 1.5,
                        marginRight: 1.5
                    }}
                >
                    <Typography align={"center"} color={"purple"}>
                        Taro
                    </Typography>
                </Box>
                <Box
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    sx={{
                        border: 1,
                        padding: 2,
                        marginLeft: 1.5,
                        marginRight: 1.5
                    }}
                >
                    <Typography align={"center"} color={"greenyellow"}>
                        Pandan
                    </Typography>
                </Box>
                <Box
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    sx={{
                        border: 1,
                        padding: 2,
                        marginLeft: 1.5,
                        marginRight: 1.5
                    }}
                >
                    <Typography align={"center"}>Chestnut</Typography>
                </Box>
                <Box
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    sx={{
                        border: 1,
                        padding: 2,
                        marginLeft: 1.5,
                        marginRight: 1.5
                    }}
                >
                    <Typography align={"center"}>???</Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default IceCream;
