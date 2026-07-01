import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

import { Box, Grid, Typography, useMediaQuery, useTheme } from "@mui/material";

import Logo from "../../../images/logo.webp";
import { useAppContext } from "../../AppContext";

type NetworkInformation = { type?: string; effectiveType?: string };

const getNetworkLabel = (): string | null => {
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    if (connection?.type && connection.type !== "unknown") {
        return connection.type.toUpperCase();
    }
    if (connection?.effectiveType) {
        return connection.effectiveType.toUpperCase();
    }
    return null;
};

const BootUp = (props: {
    setBootingUp: Dispatch<SetStateAction<boolean>>;
    creationDate: string;
}) => {
    const [state, setState] = useState(0);
    const { setShouldBootUp } = useAppContext();

    useEffect(() => {
        setTimeout(() => setState(1), 300);
        setTimeout(() => setState(2), 450);
        setTimeout(() => setState(3), 650);
        setTimeout(() => setState(4), 850);
        setTimeout(() => setState(5), 1050);
        setTimeout(() => setState(6), 1200);
        setTimeout(() => setState(7), 1350);
        setTimeout(() => setState(8), 1500);
        setTimeout(() => setState(9), 1650);
        setTimeout(() => setState(10), 1800);
        setTimeout(() => setState(11), 1950);
        setTimeout(() => setState(12), 2200);
        setTimeout(() => setState(13), 2500);
        setTimeout(() => setState(14), 3000);
        setTimeout(() => setState(15), 3500);
        setTimeout(() => setState(16), 3850);
        setTimeout(() => setState(17), 4350);
        setTimeout(() => setState(18), 4700);
        setTimeout(() => setState(19), 5250);
        setTimeout(() => {
            setShouldBootUp(false);
            props.setBootingUp(false);
        }, 6400);
    }, []);

    return (
        <Grid container direction={"column"} spacing={4}>
            <Grid>
                <Header />
            </Grid>
            <Grid>
                <ReleaseData creationDate={props.creationDate} />
            </Grid>
            {state >= 1 ? <Grid>AF6S7V89 - JUC84X</Grid> : null}
            {state >= 2 ? (
                <Grid>
                    <SystemInfo state={state} />
                </Grid>
            ) : null}
            {state >= 11 ? (
                <Grid>
                    <DriveInfo state={state} />
                </Grid>
            ) : null}
            {state >= 15 ? (
                <Grid>
                    <Grid container direction={"column"} spacing={1}>
                        <NetworkInfo state={state} />
                        {state >= 17 ? (
                            <Grid>
                                <Typography>
                                    {" "}
                                    Initializing OS . . . . . .
                                    {state >= 18 ? (
                                        <span style={{ color: "#2BC903" }}> SUCCESS </span>
                                    ) : null}
                                </Typography>
                            </Grid>
                        ) : null}
                    </Grid>
                </Grid>
            ) : null}
            {state >= 19 ? (
                <Grid>
                    <StartingComputer />
                </Grid>
            ) : null}
        </Grid>
    );
};

const Header = () => {
    const muiTheme = useTheme();
    const smallScreen = useMediaQuery(muiTheme.breakpoints.down("md"));
    return (
        <Grid container spacing={4}>
            <Grid>
                <img src={Logo} alt={"Logo"} style={{ width: 100, height: 100 }} />
            </Grid>
            <Grid>
                <Grid
                    container
                    justifyContent={"center"}
                    alignContent={"center"}
                    alignItems={"center"}
                    direction={"column"}
                    style={{ height: "100%" }}
                >
                    <Grid>
                        {smallScreen ? (
                            <>
                                <Typography>Rosoff OS</Typography>
                                <Typography>(BETA PROGRAM)</Typography>
                            </>
                        ) : (
                            <Typography>Rosoff OS (BETA PROGRAM)</Typography>
                        )}
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

const ReleaseData = (props: { creationDate: string }) => {
    return (
        <Grid container justifyContent={"center"} direction={"column"} style={{ height: "100%" }}>
            <Grid>
                <Typography>Released: {props.creationDate}</Typography>
            </Grid>
            <Grid>
                <a
                    href={"https://github.com/mrrosoff/Personal-Website"}
                    target="_blank"
                    style={{ color: "#FCFCFC", fontSize: 22 }}
                >
                    Open Source (BETA 4.1.2)
                </a>
            </Grid>
        </Grid>
    );
};

const SystemInfo = (props: { state: number }) => {
    return (
        <Grid container direction={"column"} style={{ paddingLeft: 20 }}>
            {props.state >= 3 ? (
                <Grid>
                    <Box sx={{ pl: 1, pr: 1 }}>
                        <Grid container spacing={2}>
                            <Grid>
                                <Typography>User:</Typography>
                            </Grid>
                            <Grid>
                                <Typography>Developer</Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
            ) : null}
            {props.state >= 4 ? (
                <Grid>
                    <Box sx={{ pl: 1, pr: 1 }}>
                        <Grid container spacing={2}>
                            <Grid>
                                <Typography>Device Name:</Typography>
                            </Grid>
                            <Grid>
                                <Typography>Rosoff Virtual Machine</Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
            ) : null}
            {props.state >= 5 ? (
                <Grid>
                    <Box sx={{ pl: 1, pr: 1 }}>
                        <Grid container spacing={2}>
                            <Grid>
                                <Typography>Memory Test:</Typography>
                            </Grid>
                            <Grid>
                                <Typography>
                                    {
                                        // prettier-ignore
                                        props.state === 6 ? "20KB" : 
                                        props.state === 7 ? "87KB" :
                                        props.state === 8 ? "173KB" : 
                                        props.state === 9 ? "837KM" : 
                                        props.state === 10 ? "1.1MB" : 
                                        "2.0MB"
                                    }
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
            ) : null}
        </Grid>
    );
};

const DriveInfo = (props: { state: number }) => {
    const muiTheme = useTheme();
    const smallScreen = useMediaQuery(muiTheme.breakpoints.down("md"));
    return (
        <Grid container direction={"column"} spacing={1}>
            {props.state >= 12 ? (
                <Grid>
                    <header>
                        <Typography>
                            Detecting {smallScreen ? "" : "Primary "}Drive (/dev/sda1)
                            {smallScreen ? " . . . ." : " . . . . . ."}
                            {props.state >= 13 ? (
                                <span style={{ color: "#2BC903" }}> SUCCESS </span>
                            ) : null}
                        </Typography>
                    </header>
                </Grid>
            ) : null}
            {props.state >= 12 ? (
                <Grid>
                    <header>
                        <Typography>
                            Detecting {smallScreen ? "" : "Secondary "}Drive (/dev/sda2)
                            {smallScreen ? " . . . ." : " . . . . . ."}
                            {props.state >= 14 ? (
                                <span style={{ color: "#2BC903" }}> SUCCESS </span>
                            ) : null}
                        </Typography>
                    </header>
                </Grid>
            ) : null}
        </Grid>
    );
};
const NetworkInfo = (props: { state: number }) => {
    const muiTheme = useTheme();
    const smallScreen = useMediaQuery(muiTheme.breakpoints.down("md"));
    const online = navigator.onLine;
    const networkLabel = getNetworkLabel();
    return (
        <Grid>
            <header>
                <Typography>
                    Detecting Network Link{networkLabel ? ` (${networkLabel})` : ""}
                    {smallScreen ? " . . ." : " . . . . . ."}
                    {props.state >= 16 ? (
                        <span style={{ color: online ? "#2BC903" : "#ff0606" }}>
                            {online ? " CONNECTED " : " OFFLINE "}
                        </span>
                    ) : null}
                </Typography>
            </header>
        </Grid>
    );
};

const StartingComputer = () => {
    const [dots, setDots] = useState(".");
    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
        }, 250);
        return () => clearInterval(interval);
    }, []);
    return <Grid>Starting Computer {dots}</Grid>;
};

export default BootUp;
