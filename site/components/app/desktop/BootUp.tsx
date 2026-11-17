import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import { Box, Grid, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";

import { HAS_BOOTED_KEY, useAppContext } from "../../AppContext";

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

const STEP_TIMES = [
    300, 450, 650, 850, 1050, 1200, 1350, 1500, 1650, 1800, 1950, 2200, 2500, 3000, 3500, 3850,
    4350, 4700, 5250
];
const FINISHED_AT = 6400;

type BootUpProps = {
    setBootingUp: Dispatch<SetStateAction<boolean>>;
    creationDate: string;
};

const BootUp = ({ setBootingUp, creationDate }: BootUpProps) => {
    const [state, setState] = useState(0);
    const { setShouldBootUp } = useAppContext();
    const muiTheme = useTheme();
    const smallScreen = useMediaQuery(muiTheme.breakpoints.down("md"));

    useEffect(() => {
        const timeouts = STEP_TIMES.map((ms, step) => setTimeout(() => setState(step + 1), ms));
        timeouts.push(
            setTimeout(() => {
                sessionStorage.setItem(HAS_BOOTED_KEY, "true");
                setShouldBootUp(false);
                setBootingUp(false);
            }, FINISHED_AT)
        );
        return () => timeouts.forEach(clearTimeout);
    }, [setBootingUp, setShouldBootUp]);

    return (
        <Stack spacing={4}>
            <Grid>
                <Header />
            </Grid>
            <Grid>
                <ReleaseData creationDate={creationDate} />
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
                    <Stack spacing={1}>
                        <NetworkInfo state={state} />
                        {state >= 17 && !smallScreen ? (
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
                    </Stack>
                </Grid>
            ) : null}
            {state >= 19 ? (
                <Grid>
                    <StartingComputer />
                </Grid>
            ) : null}
        </Stack>
    );
};

const Header = () => {
    const muiTheme = useTheme();
    const smallScreen = useMediaQuery(muiTheme.breakpoints.down("md"));
    return (
        <Grid container spacing={4}>
            <Grid>
                <img src="/images/logo.webp" alt={"Logo"} style={{ width: 100, height: 100 }} />
            </Grid>
            <Grid>
                <Stack sx={{ justifyContent: "center", alignItems: "center", height: "100%" }}>
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
                </Stack>
            </Grid>
        </Grid>
    );
};

const ReleaseData = (props: { creationDate: string }) => {
    return (
        <Stack sx={{ justifyContent: "center", height: "100%" }}>
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
        </Stack>
    );
};

const SystemInfo = (props: { state: number }) => {
    return (
        <Stack sx={{ paddingLeft: "20px" }}>
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
        </Stack>
    );
};

const DriveInfo = (props: { state: number }) => {
    const muiTheme = useTheme();
    const smallScreen = useMediaQuery(muiTheme.breakpoints.down("md"));
    return (
        <Stack spacing={1}>
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
            {props.state >= 12 && !smallScreen ? (
                <Grid>
                    <header>
                        <Typography>
                            Detecting Secondary Drive (/dev/sda2)
                            {" . . . . . ."}
                            {props.state >= 14 ? (
                                <span style={{ color: "#2BC903" }}> SUCCESS </span>
                            ) : null}
                        </Typography>
                    </header>
                </Grid>
            ) : null}
        </Stack>
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
        const interval = setInterval(
            () => setDots((prev) => (prev.length >= 3 ? "." : prev + ".")),
            250
        );
        return () => clearInterval(interval);
    }, []);
    return <Grid>Starting Computer {dots}</Grid>;
};

export default BootUp;
