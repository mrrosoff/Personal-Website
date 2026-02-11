import { Dispatch, RefObject, SetStateAction, useState } from "react";
import { Link, useMatch, useNavigate } from "react-router-dom";

import { Avatar, Box, Button, Paper, useMediaQuery, useTheme } from "@mui/material";

import { DesktopSocialButtonList } from "./SocialButtons";
import BootUp from "./desktop/BootUp";
import TerminalEmbed from "./desktop/TerminalEmbed";
import { useIceCreamCart } from "../ice-cream/IceCreamCartContext";

import SmallProfile from "../../images/small-profile.webp";
import MobileLayout from "./MobileLayout";

const Page = (props: {
    shouldBootUp: boolean;
    setShouldBootUp: Dispatch<SetStateAction<boolean>>;
    inputRef: RefObject<HTMLInputElement | null>;
    scrollContainerRef: RefObject<HTMLDivElement | null>;
}) => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("md"));

    const [bootingUp, setBootingUp] = useState(props.shouldBootUp);

    const creationDate = new Date();
    creationDate.setMinutes(creationDate.getMinutes() - 8);
    creationDate.setHours(creationDate.getHours() - 2);
    creationDate.setDate(creationDate.getDate() - 5);

    if (smallScreen) {
        return <MobileLayout />;
    }

    if (bootingUp) {
        return (
            <BootUp
                setBootingUp={setBootingUp}
                setShouldBootUp={props.setShouldBootUp}
                creationDate={creationDate.toString()}
            />
        );
    }

    return <TerminalEmbed ref={props.inputRef} scrollContainerRef={props.scrollContainerRef} />;
};

export const LinksAndMenu = (props: {}) => {
    const [open, setOpen] = useState(false);
    return (
        <Box sx={{ position: "relative" }}>
            <Links open={open} setOpen={setOpen} {...props} />
            <Box sx={{ position: "absolute", top: 65, right: 0, zIndex: 10 }}>
                {open && (
                    <Paper sx={{ width: 270 }}>
                        <DesktopSocialButtonList />
                    </Paper>
                )}
            </Box>
            <Avatar
                alt="Max Rosoff"
                src={SmallProfile}
                onClick={() => setOpen(!open)}
                sx={{
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

const Links = (props: { open: boolean; setOpen: Dispatch<SetStateAction<boolean>> }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("md"));
    const isIceCream = useMatch("/ice-cream");
    const { selectedPriceIds } = useIceCreamCart();

    const handleCartClick = () => {
        const priceIdsParam = selectedPriceIds.join(",");
        navigate(`/ice-cream/checkout?priceIds=${priceIdsParam}`);
    };

    return (
        <Box sx={{ position: "absolute", top: 0, right: 80, display: "flex", gap: 2.5 }}>
            <Link to={isIceCream ? "/" : "ice-cream"} style={{ color: "#FCFCFC", fontSize: 22 }}>
                {isIceCream ? "Home" : "Ice Cream"}
            </Link>
            {isIceCream && (
                <Box
                    sx={{
                        position: "relative",
                        "&:hover .elastic-underline": {
                            display: "none"
                        }
                    }}
                >
                    <a
                        style={{
                            margin: 0,
                            color:
                                selectedPriceIds.length === 0
                                    ? "rgba(252, 252, 252, 0.5)"
                                    : "#FCFCFC",
                            fontSize: 22,
                            cursor: selectedPriceIds.length === 0 ? "default" : "pointer"
                        }}
                        onClick={selectedPriceIds.length > 0 ? handleCartClick : undefined}
                    >
                        Cart ({selectedPriceIds.length})
                    </a>
                    {!smallScreen && selectedPriceIds.length > 0 && (
                        <Box
                            sx={{
                                position: "absolute",
                                top: -4,
                                right: -4,
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: theme.palette.secondary.main,
                                border: "1px solid white",
                                animation: "pulse 2s ease-in-out infinite",
                                "@keyframes pulse": {
                                    "0%, 100%": {
                                        opacity: 1,
                                        transform: "scale(0.8)"
                                    },
                                    "50%": {
                                        opacity: 0.7,
                                        transform: "scale(1)"
                                    }
                                }
                            }}
                        />
                    )}
                </Box>
            )}
            <Button
                disableRipple
                onClick={() => props.setOpen(!props.open)}
                sx={{
                    color: "#FCFCFC",
                    fontSize: 22,
                    textTransform: "none",
                    padding: 0,
                    minWidth: "auto",
                    lineHeight: "normal",
                    "&:hover": {
                        backgroundColor: "transparent",
                        textDecoration: "underline"
                    }
                }}
            >
                More
            </Button>
        </Box>
    );
};

export default Page;
