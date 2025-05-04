import { useEffect, useState } from "react";

import { Box, Button, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import axios, { isAxiosError } from "axios";
import { validate } from "email-validator";

import { API_URL } from "../App";
``;
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
        >
            <Box
                display={"flex"}
                flexDirection={"column"}
                alignItems={smallScreen ? "center" : undefined}
                mb={smallScreen ? 4 : 6}
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
                    sx={{ maxWidth: smallScreen ? 300 : undefined }}
                >
                    Get notified when new ice-cream flavors are available and hear about other fun
                    things.
                </Typography>
                <MailingListForm />
            </Box>
            <Box height={smallScreen ? 150 : 250} overflow={"hidden"}>
                <img
                    src={icecreamImage}
                    alt="Ice Cream"
                    width={smallScreen ? 150 : 250}
                    style={{ transform: "rotate(15deg)" }}
                />
            </Box>
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
    const [loading, setLoading] = useState(false);
    const [registerError, setRegisterError] = useState("");
    const [success, setSuccess] = useState(false);

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
            <Box
                display={"flex"}
                flexDirection={smallScreen ? "column" : "row"}
                alignItems={smallScreen ? "center" : undefined}
            >
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
                    sx={{
                        ml: smallScreen ? 0 : 4,
                        mt: smallScreen ? 1 : 0,
                        width: smallScreen ? 300 : 250
                    }}
                />
            </Box>
            <TextField
                label="Email"
                variant="standard"
                type={"email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!emailIsValid}
                sx={{ mt: smallScreen ? 1 : 2, width: smallScreen ? 300 : 532 }}
            />
            <Button
                variant={"outlined"}
                sx={{ mt: smallScreen ? 5 : 6, width: smallScreen ? 300 : 532, fontSize: 18 }}
                disabled={!firstName || !lastName || !validate(email) || success}
                endIcon={success ? <ThumbUpIcon /> : undefined}
                loading={loading}
                onClick={async () => {
                    try {
                        setLoading(true);
                        await axios.post(`${API_URL}/register`, { firstName, lastName, email });
                        setSuccess(true);
                    } catch (error: unknown) {
                        if (isAxiosError(error)) {
                            setRegisterError(error.response?.data);
                        }
                        setRegisterError("Something Unexpected Happened...")
                    }
                    setLoading(false);
                }}
            >
                Sign Up
            </Button>
            <Typography mt={smallScreen ? 0.5 : 1} fontSize={16} color={"error"}>
                {registerError}
            </Typography>
        </Box>
    );
};

export default MailingList;
