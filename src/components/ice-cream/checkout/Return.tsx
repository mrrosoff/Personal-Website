import axios from "axios";
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { Box, Link, Typography, useMediaQuery, useTheme } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LaunchIcon from "@mui/icons-material/Launch";

import { API_URL } from "../../App";
import Stripe from "stripe";
import icecreamImage from "../../../assets/images/ice-cream.webp";

const Return = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<Stripe.Checkout.Session.Status | null>(null);
    const [customerEmail, setCustomerEmail] = useState<string | null>(null);

    useEffect(() => {
        const fetchSessionStatus = async () => {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const sessionId = urlParams.get("sessionId");

            try {
                const body = { sessionId };
                const result = await axios.post<Stripe.Checkout.Session>(
                    `${API_URL}/ice-cream/checkout-status`,
                    body
                );
                setStatus(result.data.status);
                setCustomerEmail(result.data.customer_email);
            } catch (error) {
                return navigate("/ice-cream");
            }
        };
        void fetchSessionStatus();
    }, []);

    if (status === "open") {
        return <Navigate to="/ice-cream" replace />;
    }

    if (status === "complete") {
        return <OrderConfirmation customerEmail={customerEmail} />;
    }
    return null;
};

const OrderConfirmation = ({ customerEmail }: { customerEmail: string | null }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("md"));

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="space-around"
            height={"100%"}
        >
            <Box>
                <Box
                    display="flex"
                    flexDirection={smallScreen ? "column" : undefined}
                    alignItems="center"
                    mb={smallScreen ? 2 : 3}
                >
                    <Typography
                        variant="h1"
                        align="center"
                        sx={{ maxWidth: smallScreen ? 350 : undefined }}
                    >
                        Order Confirmed
                    </Typography>
                    {!smallScreen && (
                        <CheckCircleOutlineIcon sx={{ fontSize: smallScreen ? 36 : 48, ml: 2 }} />
                    )}
                </Box>

                <Typography
                    align={smallScreen ? "center" : undefined}
                    mt={smallScreen ? 1 : undefined}
                    sx={{
                        color: "text.primary"
                    }}
                >
                    Thank you for your order! We're excited to make your ice cream. A confirmation
                    email has been sent to <Box component="span">{customerEmail}</Box>.
                </Typography>
                <Typography mt={4} align={smallScreen ? "center" : undefined}>
                    If you have any questions, please email{" "}
                    <Link
                        component="button"
                        onClick={() => navigate("mailto:help@maxrosoff.com")}
                        underline="hover"
                        sx={{
                            cursor: "pointer",
                            color: "inherit",
                            verticalAlign: "baseline",
                            position: "relative",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.3
                        }}
                    >
                        help@maxrosoff.com
                    </Link>
                    .
                </Typography>
                <Typography mt={2} align={smallScreen ? "center" : undefined}>
                    Or even better, head
                    <Link
                        component="button"
                        onClick={() => navigate("mailto:help@maxrosoff.com")}
                        underline="hover"
                        sx={{
                            cursor: "pointer",
                            color: "inherit",
                            verticalAlign: "baseline",
                            position: "relative",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.3
                        }}
                    >
                        here
                        <LaunchIcon sx={{ fontSize: 10, position: "relative", top: -4 }} />
                    </Link>
                    to buy more ice cream.
                </Typography>
            </Box>
            <Box height={smallScreen ? 320 : 320} overflow="hidden">
                <img
                    src={icecreamImage}
                    alt="Ice Cream"
                    width={smallScreen ? 320 : 320}
                    style={{ transform: "rotate(15deg)" }}
                />
            </Box>
        </Box>
    );
};

export default Return;
