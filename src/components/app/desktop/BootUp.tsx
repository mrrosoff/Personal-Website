import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { Box, Grid, Typography } from "@mui/material";

import Logo from "../../../assets/images/logo.webp";

const BootUp = (props: {
    setBootingUp: Dispatch<SetStateAction<boolean>>;
    setShouldBootUp: Dispatch<SetStateAction<boolean>>;
    creationDate: string;
}) => {
    const [state, setState] = useState(0);

    useEffect(() => {
        setTimeout(() => setState(1), 300);
        setTimeout(() => setState(2), 500);
        setTimeout(() => setState(3), 8000);
        setTimeout(() => setState(4), 1200);
        setTimeout(() => setState(5), 1500);
        setTimeout(() => setState(6), 1600);
        setTimeout(() => setState(7), 1700);
        setTimeout(() => setState(8), 1800);
        setTimeout(() => setState(9), 1900);
        setTimeout(() => setState(10), 2100);
        setTimeout(() => setState(11), 2400);
        setTimeout(() => setState(12), 3000);
        setTimeout(() => setState(13), 3500);
        setTimeout(() => setState(14), 4000);
        setTimeout(() => setState(15), 4500);
        setTimeout(() => setState(16), 5000);
        setTimeout(() => setState(17), 5500);
        setTimeout(() => setState(18), 5800);
        setTimeout(() => {
            props.setShouldBootUp(false);
            props.setBootingUp(false);
        }, 8000);
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
            {state >= 16 ? (
                <Grid>
                    <Typography>
                        {" "}
                        Initializing OS . . . . . .
                        {state >= 17 ? <span style={{ color: "#2BC903" }}> SUCCESS </span> : null}
                    </Typography>
                </Grid>
            ) : null}
            {state >= 18 ? <Grid>Starting Computer . . .</Grid> : null}
        </Grid>
    );
};

const Header = () => {
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
                        <Typography>Rosoff OS (BETA PROGRAM)</Typography>
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
    return (
        <Grid container direction={"column"} spacing={1}>
            {props.state >= 12 ? (
                <Grid>
                    <header>
                        <Typography>
                            Detecting Primary Drive (/dev/sda1) . . . . . .
                            {props.state >= 13 ? (
                                <span style={{ color: "#2BC903" }}> SUCCESS </span>
                            ) : null}
                        </Typography>
                    </header>
                </Grid>
            ) : null}
            {props.state >= 14 ? (
                <Grid>
                    <header>
                        <Typography>
                            Detecting Secondary Drive (/dev/sda2) . . . . . .
                            {props.state >= 15 ? (
                                <span style={{ color: "#2BC903" }}> SUCCESS </span>
                            ) : null}
                        </Typography>
                    </header>
                </Grid>
            ) : null}
        </Grid>
    );
};
export default BootUp;
