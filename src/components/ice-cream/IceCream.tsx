import { ReactElement } from "react";

import { Box, Typography } from "@mui/material";
import ArrowRightAltRoundedIcon from "@mui/icons-material/ArrowRightAltRounded";

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
            <Box display={"flex"} alignItems={"center"} sx={{ paddingTop: 4 }}>
                <Box
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    sx={{
                        width: 250,
                        height: 150,
                        border: 1,
                        padding: 2,
                        marginRight: 1.5
                    }}
                >
                    <Typography align={"center"}>Mystery</Typography>
                </Box>
                <Card>Peaches</Card>
            </Box>
        </Box>
    );
};

export const Schedule = () => {
    return (
        <Box>
            <Typography sx={{ paddingTop: 5 }} variant="h2">
                Whats Coming Up...
            </Typography>
            <Box display={"flex"} alignItems={"center"} sx={{ paddingTop: 4 }}>
                <Box
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    sx={{
                        width: 250,
                        height: 150,
                        border: 1,
                        padding: 2,
                        marginRight: 1.5
                    }}
                >
                    <Typography align={"center"}>Blueberry Matcha</Typography>
                </Box>
                <ArrowRightAltRoundedIcon
                    sx={{ fontSize: 40, marginLeft: 1.5, marginRight: 1.5 }}
                />
                <Card>Mexican Hot Chocolate</Card>
                <ArrowRightAltRoundedIcon
                    sx={{ fontSize: 40, marginLeft: 1.5, marginRight: 1.5 }}
                />
                <Card>?</Card>
                <ArrowRightAltRoundedIcon
                    sx={{ fontSize: 40, marginLeft: 1.5, marginRight: 1.5 }}
                />
                <Card>?</Card>
            </Box>
        </Box>
    );
};

export const Card = (props: { children: string }) => {
    return (
        <Box
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            sx={{
                width: 250,
                height: 150,
                border: 1,
                padding: 2,
                marginLeft: 1.5,
                marginRight: 1.5
            }}
        >
            <Typography align={"center"}>{props.children}</Typography>
        </Box>
    );
};

export default IceCream;
