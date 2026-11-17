import { useState } from "react";

import { Box, Button, useMediaQuery, useTheme } from "@mui/material";
import axios, { isAxiosError } from "axios";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";

import { decodeToken, unexpiredToken } from "../../auth";
import { API_ENDPOINT_URL, UserType } from "../../../api/types";
import type { ErrorResponseBody } from "../../../api/types";
import IceCreamPage from "./IceCreamPage";

type CancelStatus =
    | { state: "idle" }
    | { state: "cancelling" }
    | { state: "cancelled" }
    | { state: "failed"; message: string }
    | { state: "rejected" };

const CancelSubscription = () => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token") ?? "";

    const [status, setStatus] = useState<CancelStatus>({ state: "idle" });

    const onCancel = async () => {
        setStatus({ state: "cancelling" });
        try {
            await axios.post(`${API_ENDPOINT_URL}/ice-cream/cancel`, { token });
            setStatus({ state: "cancelled" });
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 401) {
                setStatus({ state: "rejected" });
            } else if (isAxiosError<ErrorResponseBody>(error) && error.response?.data.message) {
                setStatus({ state: "failed", message: error.response.data.message });
            } else {
                setStatus({
                    state: "failed",
                    message: "That did not go through. Try again in a minute."
                });
            }
        }
    };

    const payload = unexpiredToken(token) ? decodeToken(token) : null;
    if (payload?.userType !== UserType.SUBSCRIBER || status.state === "rejected") {
        return <Navigate to={"/"} replace />;
    }

    return (
        <IceCreamPage
            title={"Manage Your Subscription"}
            subtitle={
                status.state === "cancelled"
                    ? "Your subscription is cancelled and you will not be charged again. The pints you have already paid for are still yours."
                    : status.state === "failed"
                      ? status.message
                      : "This stops the monthly charge right away. Anything you have already paid for is still yours."
            }
        >
            <Box
                sx={{
                    mt: 4,
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                    justifyContent: smallScreen ? "center" : undefined
                }}
            >
                {status.state === "cancelled" ? (
                    <Button
                        variant={"outlined"}
                        sx={{ fontSize: 18 }}
                        onClick={() => void navigate("/ice-cream")}
                    >
                        Back To The Flavors
                    </Button>
                ) : (
                    <Button
                        variant={"outlined"}
                        sx={{ fontSize: 18 }}
                        loading={status.state === "cancelling"}
                        onClick={() => void onCancel()}
                    >
                        {status.state === "failed" ? "Try Again" : "Cancel Subscription"}
                    </Button>
                )}
            </Box>
        </IceCreamPage>
    );
};

export default CancelSubscription;
