import { useEffect, useState } from "react";

import { Box, Button, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import axios from "axios";
import { validate } from "email-validator";

import { API_URL } from "../App";
import icecreamImage from "../../assets/images/ice-cream.png";

const MailingList = () => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    return (
        <Box
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"space-between"}
            alignItems={smallScreen ? "center" : undefined}
            height={"100%"}
            overflow={"hidden"}
        >
            <Box
                display={"flex"}
                flexDirection={"column"}
                alignItems={smallScreen ? "center" : undefined}
            >
                <Typography
                    variant="h1"
                    align={smallScreen ? "center" : undefined}
                    sx={{ maxWidth: smallScreen ? 300 : undefined }}
                >
                    Join The Mailing List
                </Typography>
                <Typography
                    mt={smallScreen ? 1 : undefined}
                    align={smallScreen ? "center" : undefined}
                >
                    Get notified when new ice-cream flavors are available and hear about other fun
                    things.
                </Typography>
                <MailingListForm />
            </Box>
            <img
                src={icecreamImage}
                alt="Ice Cream"
                width={smallScreen ? 200 : 300}
                style={{ transform: "rotate(15deg)" }}
            />
        </Box>
    );
};

const MailingListForm = () => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [emailIsValid, setEmailIsValid] = useState(true);
    const [isSent, setIsSent] = useState(false);

    useEffect(() => {
        const isValid = !email || validate(email);
        if (isValid) {
            setEmailIsValid(true);
            return;
        }

        const timeout = setTimeout(() => setEmailIsValid(false), 2500);
        return () => clearTimeout(timeout);
    }, [email]);

    return (
        <Box
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"center"}
            sx={{ paddingTop: smallScreen ? 6 : 4 }}
        >
            <Box display={"flex"}>
                <TextField
                    label="First Name"
                    variant="standard"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    sx={{ width: smallScreen ? 300 : 250 }}
                />
                <TextField
                    label="Last Name"
                    variant="standard"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    sx={{ ml: 4, width: smallScreen ? 300 : 250 }}
                />
            </Box>
            <TextField
                label="Email"
                variant="standard"
                type={"email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!emailIsValid}
                sx={{ mt: 2, width: smallScreen ? 300 : 532 }}
            />
            <Button
                variant={"outlined"}
                sx={{ mt: 6, width: 532 }}
                disabled={!validate(email) || isSent}
                onClick={async () => {
                    await axios.post(`${API_URL}/register`, { firstName, lastName, email });
                    setIsSent(true);
                }}
            >
                Sign Up
            </Button>
        </Box>
    );
};

export default MailingList;
