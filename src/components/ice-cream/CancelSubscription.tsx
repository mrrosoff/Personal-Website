import { useState } from "react";

import { Box, Button, useMediaQuery, useTheme } from "@mui/material";
import axios from "axios";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";

import { decodeToken, unexpiredToken } from "../../auth";
import { API_ENDPOINT_URL, UserType } from "../../../api/types";
import IceCreamPage from "./IceCreamPage";

const CancelSubscription = () => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token") || "";

    const [cancelling, setCancelling] = useState(false);
    const [result, setResult] = useState<"cancelled" | "failed" | null>(null);
    const [invalidToken, setInvalidToken] = useState(false);
    const [message, setMessage] = useState("");

    const onCancel = async () => {
        setCancelling(true);
        try {
            await axios.post(`${API_ENDPOINT_URL}/ice-cream/cancel`, { token });
            setResult("cancelled");
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                setInvalidToken(true);
                setCancelling(false);
                return;
            }
            setMessage(
                (axios.isAxiosError(error) &&
                    (error.response?.data as { message?: string } | undefined)?.message) ||
                    "That did not go through. Try again in a minute."
            );
            setResult("failed");
        }
        setCancelling(false);
    };

    const payload = unexpiredToken(token) ? decodeToken(token) : null;
    if (!payload || payload.userType !== UserType.SUBSCRIBER || invalidToken) {
        return <Navigate to={"/"} replace />;
    }

    return (
        <IceCreamPage
            title={"Manage Your Subscription"}
            subtitle={
                result === "cancelled"
                    ? "Your subscription is cancelled and you will not be charged again. The pints you have already paid for are still yours."
                    : result === "failed"
                      ? message
                      : "This stops the monthly charge right away. Anything you have already paid for is still yours."
            }
        >
            <Box
                mt={4}
                display={"flex"}
                gap={2}
                flexWrap={"wrap"}
                justifyContent={smallScreen ? "center" : undefined}
            >
                {result === "cancelled" ? (
                    <Button
                        variant={"outlined"}
                        sx={{ fontSize: 18 }}
                        onClick={() => navigate("/ice-cream")}
                    >
                        Back To The Flavors
                    </Button>
                ) : (
                    <Button
                        variant={"outlined"}
                        sx={{ fontSize: 18 }}
                        disabled={cancelling}
                        loading={cancelling}
                        onClick={onCancel}
                    >
                        {result === "failed" ? "Try Again" : "Cancel Subscription"}
                    </Button>
                )}
            </Box>
        </IceCreamPage>
    );
};

export default CancelSubscription;
