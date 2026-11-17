import axios from "axios";
import { useState, useEffect } from "react";
import { Navigate, Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";

import { Box, Link, Typography, useMediaQuery, useTheme } from "@mui/material";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import LaunchIcon from "@mui/icons-material/Launch";

import { API_ENDPOINT_URL } from "../../../../api/types";
import { decodeToken } from "../../../auth";
import { useAppContext } from "../../AppContext";
import type Stripe from "stripe";

const Return = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const { friendToken } = useAppContext();
    const [status, setStatus] = useState<Stripe.Checkout.Session.Status | null>(
        friendToken ? "complete" : null
    );
    const [customerEmail, setCustomerEmail] = useState<string | null>(null);

    useEffect(() => {
        if (friendToken) {
            return;
        }

        const fetchSessionStatus = async () => {
            try {
                const body = { sessionId: params.get("sessionId") };
                const result = await axios.post<Stripe.Checkout.Session>(
                    `${API_ENDPOINT_URL}/ice-cream/checkout-status`,
                    body
                );
                setStatus(result.data.status);
                setCustomerEmail(result.data.customer_details?.email ?? result.data.customer_email);
            } catch {
                return navigate("/ice-cream");
            }
        };
        void fetchSessionStatus();
    }, [friendToken, navigate, params]);

    if (status === "open") {
        return <Navigate to="/ice-cream" replace />;
    }

    if (status === "complete") {
        return <OrderConfirmation customerEmail={customerEmail} />;
    }
    return null;
};

const OrderConfirmation = (props: { customerEmail: string | null }) => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("md"));

    const { friendToken } = useAppContext();
    const decodedToken = decodeToken(friendToken);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-around",
                height: "100%"
            }}
        >
            <Box>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: smallScreen ? "column" : undefined,
                        alignItems: "center",
                        mb: smallScreen ? 2 : 3
                    }}
                >
                    <Typography
                        variant="h1"
                        align="center"
                        sx={{ maxWidth: smallScreen ? 350 : undefined }}
                    >
                        Order Confirmed
                    </Typography>
                    {!smallScreen && <CheckCircleOutlinedIcon sx={{ fontSize: 48, ml: 2 }} />}
                </Box>

                <Typography
                    align={smallScreen ? "center" : undefined}
                    sx={{ mt: smallScreen ? 1 : undefined, color: "text.primary" }}
                >
                    {decodedToken ? (
                        <>
                            Thanks for dropping by, {decodedToken.id}! I'll deliver your ice cream
                            soon.
                        </>
                    ) : (
                        <>
                            Thank you for your order! We're excited to make your ice cream. A
                            confirmation email has been sent to{" "}
                            <Box component="span">{props.customerEmail}</Box>.
                        </>
                    )}
                </Typography>
                <Typography sx={{ mt: 4 }} align={smallScreen ? "center" : undefined}>
                    If you have any questions, please email{" "}
                    <Link
                        href="mailto:help@maxrosoff.com"
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
                <Typography sx={{ mt: 0.5 }} align={smallScreen ? "center" : undefined}>
                    Or even better, head{" "}
                    <Link
                        component={RouterLink}
                        to="/ice-cream"
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
                    </Link>{" "}
                    to buy more ice cream.
                </Typography>
            </Box>
            <Box sx={{ height: 320, overflow: "hidden" }}>
                <Box
                    component="img"
                    src="/images/ice-cream.webp"
                    alt="Ice Cream"
                    width={320}
                    sx={{ transform: "rotate(15deg)" }}
                />
            </Box>
        </Box>
    );
};

export default Return;
