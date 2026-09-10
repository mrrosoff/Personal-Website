import { useState } from "react";

import { Box, Button, Typography, useMediaQuery, useTheme } from "@mui/material";
import axios from "axios";
import { Navigate, useSearchParams } from "react-router-dom";

import { API_URL } from "../App";
import icecreamImage from "../../images/ice-cream.webp";

const CancelSubscription = () => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";

    const [cancelling, setCancelling] = useState(false);
    const [result, setResult] = useState<"cancelled" | "failed" | null>(null);
    const [message, setMessage] = useState("");

    const onCancel = async () => {
        setCancelling(true);
        try {
            await axios.post(`${API_URL}/ice-cream/cancel`, { token });
            setResult("cancelled");
        } catch (error) {
            setMessage(
                (axios.isAxiosError(error) &&
                    (error.response?.data as { message?: string } | undefined)?.message) ||
                    "That did not go through. Try again in a minute."
            );
            setResult("failed");
        }
        setCancelling(false);
    };

    if (!token) {
        return <Navigate to={"/ice-cream"} replace />;
    }

    return (
        <Box
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"space-between"}
            alignItems={smallScreen ? "center" : undefined}
            pb={4}
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
                    {result === "cancelled" ? "All Done" : "Cancel Your Subscription"}
                </Typography>
                <Typography
                    mt={smallScreen ? 2 : undefined}
                    align={smallScreen ? "center" : undefined}
                    sx={{ maxWidth: smallScreen ? 300 : 600 }}
                >
                    {result === "cancelled"
                        ? "Your subscription is cancelled and you will not be charged again. The pints you have already paid for are still yours."
                        : result === "failed"
                          ? message
                          : "This stops the monthly charge right away. Anything you have already paid for is still yours."}
                </Typography>
                {result !== "cancelled" && (
                    <Box mt={4}>
                        <Button
                            variant={"outlined"}
                            sx={{ fontSize: 18 }}
                            disabled={cancelling}
                            loading={cancelling}
                            onClick={onCancel}
                        >
                            {result === "failed" ? "Try Again" : "Cancel Subscription"}
                        </Button>
                    </Box>
                )}
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

export default CancelSubscription;
