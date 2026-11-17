import { useState } from "react";

import { Box, Button, Typography, useMediaQuery, useTheme } from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import axios, { isAxiosError } from "axios";
import { validate } from "email-validator";

import { API_ENDPOINT_URL } from "../../../api/types";
import type { MailingListRegistration, ErrorResponseBody } from "../../../api/types";
import FormField, { emailProblem } from "../FormField";
import IceCreamPage from "./IceCreamPage";

export const registerMailingListUser = async (registration: MailingListRegistration) => {
    const firstName = registration.firstName?.trim();
    const lastName = registration.lastName?.trim();
    await axios.post(`${API_ENDPOINT_URL}/email/register`, {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        email: registration.email.trim()
    });
};

const MailingList = () => (
    <IceCreamPage
        title={"Join The Mailing List"}
        subtitle={
            "Get notified when new ice cream flavors are available and hear about other fun things."
        }
    >
        <MailingListForm />
    </IceCreamPage>
);

const MailingListForm = () => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);
    const [registerError, setRegisterError] = useState("");
    const [success, setSuccess] = useState(false);

    const signUp = async () => {
        try {
            setLoading(true);
            await registerMailingListUser({ firstName, lastName, email });
            setSuccess(true);
        } catch (error: unknown) {
            if (isAxiosError<ErrorResponseBody>(error) && error.response?.data.message) {
                setRegisterError(error.response.data.message);
            } else {
                setRegisterError("Something Unexpected Happened...");
            }
        }
        setLoading(false);
    };

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
                onClick={() => void signUp()}
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
