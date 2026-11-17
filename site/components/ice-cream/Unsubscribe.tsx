import { useState } from "react";

import { Box, Button, Typography, useMediaQuery, useTheme } from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import axios, { isAxiosError } from "axios";
import { validate } from "email-validator";

import { API_ENDPOINT_URL } from "../../../api/types";
import type { ErrorResponseBody } from "../../../api/types";
import FormField, { emailProblem } from "../FormField";
import IceCreamPage from "./IceCreamPage";

type SubmitStatus =
    | { state: "idle" }
    | { state: "sending" }
    | { state: "sent" }
    | { state: "failed"; message: string };

const Unsubscribe = () => (
    <IceCreamPage
        title={"Unsubscribe"}
        subtitle={"Ok fine but I didn't want to send you emails anyways."}
    >
        <UnsubscribeForm />
    </IceCreamPage>
);

const UnsubscribeForm = () => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const [email, setEmail] = useState("");

    const [status, setStatus] = useState<SubmitStatus>({ state: "idle" });

    const unsubscribe = async () => {
        setStatus({ state: "sending" });
        try {
            await axios.post(`${API_ENDPOINT_URL}/email/unsubscribe`, { email });
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
                disabled={!validate(email) || status.state === "sent"}
                endIcon={status.state === "sent" ? <ThumbUpIcon /> : undefined}
                loading={status.state === "sending"}
                onClick={() => void unsubscribe()}
            >
                Remove From Mailing List
            </Button>
            <Typography sx={{ mt: smallScreen ? 0.5 : 1, fontSize: 16 }} color={"error"}>
                {status.state === "failed" && status.message}
            </Typography>
        </Box>
    );
};

export default Unsubscribe;
