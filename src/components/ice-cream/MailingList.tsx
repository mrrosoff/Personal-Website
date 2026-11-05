import { useState } from "react";

import { Box, Button, Typography, useMediaQuery, useTheme } from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import axios, { isAxiosError } from "axios";
import { validate } from "email-validator";

import type { MailingListRegistration } from "../../../api/types";
import icecreamImage from "../../images/ice-cream.webp";
import { API_URL } from "../App";
import FormField, { emailProblem } from "../FormField";

export const registerMailingListUser = async (registration: MailingListRegistration) => {
    const { data } = await axios.post(`${API_URL}/email/register`, {
        firstName: registration.firstName?.trim() || undefined,
        lastName: registration.lastName?.trim() || undefined,
        email: registration.email.trim()
    });
    return data;
};

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
                    Get notified when new ice cream flavors are available and hear about other fun
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

    const [loading, setLoading] = useState(false);
    const [registerError, setRegisterError] = useState("");
    const [success, setSuccess] = useState(false);

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
                <FormField
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={"Karl"}
                    sx={{ width: smallScreen ? 300 : 250 }}
                    autoComplete="given-name"
                />
                <FormField
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={"The Fog"}
                    sx={{
                        ml: smallScreen ? 0 : 4,
                        mt: smallScreen ? 1.5 : 0,
                        width: smallScreen ? 300 : 250
                    }}
                    autoComplete="family-name"
                />
            </Box>
            <FormField
                label="Email"
                type={"email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                problem={emailProblem}
                placeholder={"karl@fog.sf"}
                sx={{ mt: smallScreen ? 1.5 : 2, width: smallScreen ? 300 : 532 }}
                autoComplete="email"
            />
            <Button
                variant={"contained"}
                size={"large"}
                sx={{
                    mt: smallScreen ? 5 : 6,
                    width: smallScreen ? 300 : 532,
                    fontSize: 20,
                    backgroundColor: "#52535F",
                    color: "white",
                    ":hover": { backgroundColor: "#5F6272" }
                }}
                disabled={!firstName || !lastName || !validate(email) || success}
                endIcon={success ? <ThumbUpIcon /> : undefined}
                loading={loading}
                onClick={async () => {
                    try {
                        setLoading(true);
                        await registerMailingListUser({ firstName, lastName, email });
                        setSuccess(true);
                    } catch (error: unknown) {
                        setRegisterError(
                            (isAxiosError(error) && error.response?.data?.message) ||
                                "Something Unexpected Happened..."
                        );
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
