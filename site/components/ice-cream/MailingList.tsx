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

type SubmitStatus =
    | { state: "idle" }
    | { state: "sending" }
    | { state: "sent" }
    | { state: "failed"; message: string };

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

    const [status, setStatus] = useState<SubmitStatus>({ state: "idle" });

    const signUp = async () => {
        setStatus({ state: "sending" });
        try {
            await registerMailingListUser({ firstName, lastName, email });
            setStatus({ state: "sent" });
        } catch (error: unknown) {
            if (isAxiosError<ErrorResponseBody>(error) && error.response?.data.message) {
                setStatus({ state: "failed", message: error.response.data.message });
            } else {
                setStatus({ state: "failed", message: "Something Unexpected Happened..." });
            }
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                paddingTop: smallScreen ? 6 : 4
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: smallScreen ? "column" : "row",
                    alignItems: smallScreen ? "center" : undefined
                }}
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
                disabled={!firstName || !lastName || !validate(email) || status.state === "sent"}
                endIcon={status.state === "sent" ? <ThumbUpIcon /> : undefined}
                loading={status.state === "sending"}
                onClick={() => void signUp()}
            >
                Sign Up
            </Button>
            <Typography sx={{ mt: smallScreen ? 0.5 : 1, fontSize: 16 }} color={"error"}>
                {status.state === "failed" && status.message}
            </Typography>
        </Box>
    );
};

export default MailingList;
