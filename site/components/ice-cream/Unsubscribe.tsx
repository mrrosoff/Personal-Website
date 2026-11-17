import { useState } from "react";

import { Box, Button, Typography, useMediaQuery, useTheme } from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import axios, { isAxiosError } from "axios";
import { validate } from "email-validator";

import { API_ENDPOINT_URL } from "../../../api/types";
import FormField, { emailProblem } from "../FormField";
import IceCreamPage from "./IceCreamPage";

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
            <FormField
                label="Email"
                type={"email"}
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value);
                }}
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
                disabled={!validate(email) || success}
                endIcon={success ? <ThumbUpIcon /> : undefined}
                loading={loading}
                onClick={async () => {
                    try {
                        setLoading(true);
                        await axios.post(`${API_ENDPOINT_URL}/email/unsubscribe`, { email });
                        setSuccess(true);
                    } catch (error: unknown) {
                        setRegisterError(
                            (isAxiosError<{ message?: string }>(error) &&
                                error.response?.data?.message) ||
                                "Something Unexpected Happened..."
                        );
                    }
                    setLoading(false);
                }}
            >
                Remove From Mailing List
            </Button>
            <Typography mt={smallScreen ? 0.5 : 1} fontSize={16} color={"error"}>
                {registerError}
            </Typography>
        </Box>
    );
};

export default Unsubscribe;
