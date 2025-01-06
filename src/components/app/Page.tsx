import { useState } from "react";
import { Link, useMatch } from "react-router-dom";

import { Avatar, Box, Paper, useMediaQuery, useTheme } from "@mui/material";

import { DesktopSocialButtonList } from "./SocialButtons";
import BootUp from "./desktop/BootUp";
import TerminalEmbed from "./desktop/TerminalEmbed";

import SmallProfile from "../../assets/images/small-profile.webp";
import MobileLayout from "./MobileLayout";

const Page = (props: any) => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("md"));

    const [bootingUp, setBootingUp] = useState(import.meta.env.PROD);

    const creationDate = new Date();
    creationDate.setMinutes(creationDate.getMinutes() - 8);
    creationDate.setHours(creationDate.getHours() - 2);
    creationDate.setDate(creationDate.getDate() - 5);

    if (smallScreen) {
        return <MobileLayout />;
    }

    if (bootingUp) {
        return <BootUp setBootingUp={setBootingUp} creationDate={creationDate.toString()} />;
    }

    return <TerminalEmbed ref={props.inputRef} />;
};

export const LinksAndMenu = (props: any) => {
    const [open, setOpen] = useState(false);
    return (
        <Box sx={{ position: "relative" }}>
            <Links open={open} setOpen={setOpen} {...props} />
            <Box sx={{ position: "absolute", top: 65, right: 0 }}>
                {open && (
                    <Paper style={{ width: 270 }}>
                        <DesktopSocialButtonList />
                    </Paper>
                )}
            </Box>
            <Avatar
                alt="Max Rosoff"
                src={SmallProfile}
                onClick={() => setOpen(!open)}
                style={{
                    width: 55,
                    height: 55,
                    borderStyle: "solid",
                    borderWidth: "1px",
                    borderColor: "#FFFFFF",
                    position: "absolute",
                    top: 0,
                    right: 0
                }}
            />
        </Box>
    );
};

const Links = (props: any) => {
    const isIceCream = useMatch("/ice-cream");
    return (
        <Box sx={{ position: "absolute", top: 0, right: 80, display: "flex" }}>
            <Link
                to={isIceCream ? "/" : "ice-cream"}
                style={{ paddingRight: 20, color: "#FCFCFC", fontSize: 22 }}
            >
                {isIceCream ? "Home" : "Ice Cream"}
            </Link>
            <Link
                to={"https://github.com/mrrosoff/Personal-Website"}
                target="_blank"
                style={{ paddingRight: 20, color: "#FCFCFC", fontSize: 22 }}
            >
                Source
            </Link>
            <a
                style={{ margin: 0, color: "#FCFCFC", fontSize: 22 }}
                onClick={() => props.setOpen(!props.open)}
            >
                More
            </a>
        </Box>
    );
};

export default Page;