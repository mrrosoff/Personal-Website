import { useState } from "react";

import axios from "axios";
import { validate } from "email-validator";
import { Box, Divider, Grid, Link, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useCheckout } from "@stripe/react-stripe-js/checkout";

import { API_ENDPOINT_URL } from "../../../../../api/types";
import { useCheckoutForm } from "./CheckoutFormContext";
import ContactFields from "./ContactFields";
import OrderLines, { orderBoxSx } from "./OrderLines";
import { LoadingPaymentElement, PayButton } from "./PaymentFields";

const CompactLayout = () => {
    const { email, selectedFlavors, setPaymentComplete, subscription } = useCheckoutForm();
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("md"));
    const state = useCheckout();
    const [manageResult, setManageResult] = useState<"sent" | "failed" | null>(null);
    const canManage = validate(email);

    const onManage = async () => {
        try {
            await axios.post(`${API_ENDPOINT_URL}/ice-cream/unsubscribe`, { email: email });
            setManageResult("sent");
        } catch {
            setManageResult("failed");
        }
    };

    return (
        <Box sx={{ pb: 4 }}>
            <Typography variant={"h1"} sx={{ mb: 3 }}>
                Checkout
            </Typography>
            <Grid
                container
                spacing={smallScreen ? 4 : 2}
                sx={{ flexDirection: smallScreen ? "column-reverse" : "row" }}
            >
                <Grid size={{ xs: 12, md: 6 }} sx={{ pr: smallScreen ? 0 : 10 }}>
                    <ContactFields />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant={"h2"} sx={{ mb: 2 }}>
                        Your Order
                    </Typography>
                    <Box sx={orderBoxSx(smallScreen)}>
                        {subscription &&
                            state.type === "success" &&
                            state.checkout.lineItems.map((item, index) => (
                                <Box key={item.id}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            gap: 2,
                                            alignItems: "center",
                                            py: smallScreen ? 1.5 : 2
                                        }}
                                    >
                                        <Typography noWrap>{item.name}</Typography>
                                        <Typography sx={{ flexShrink: 0 }}>
                                            {item.total.amount}
                                        </Typography>
                                    </Box>
                                    {index < state.checkout.lineItems.length - 1 && <Divider />}
                                </Box>
                            ))}
                        <OrderLines flavors={selectedFlavors} smallScreen={smallScreen} />
                    </Box>
                    {subscription && (
                        <Typography sx={{ mt: 1.5, fontSize: "0.9em", opacity: 0.7 }}>
                            {state.type === "success" &&
                                `Renews monthly at ${state.checkout.total.total.amount} until you cancel. `}
                            {manageResult === "sent" ? (
                                "Check your email for a link."
                            ) : manageResult === "failed" ? (
                                "That did not go through. Try again in a minute."
                            ) : (
                                <Link
                                    component={"span"}
                                    role={"button"}
                                    tabIndex={canManage ? 0 : -1}
                                    aria-disabled={!canManage}
                                    onClick={canManage ? () => void onManage() : undefined}
                                    onKeyDown={(e) => {
                                        if (canManage && e.key === "Enter") void onManage();
                                    }}
                                    underline={canManage ? "hover" : "none"}
                                    sx={{
                                        color: "inherit",
                                        fontSize: "inherit",
                                        cursor: canManage ? "pointer" : "default",
                                        opacity: canManage ? 1 : 0.5
                                    }}
                                >
                                    Already subscribed? Email me a cancel link.
                                </Link>
                            )}
                        </Typography>
                    )}
                </Grid>
            </Grid>
            <Typography variant={"h2"} sx={{ mt: 4, mb: 2 }}>
                Payment
            </Typography>
            <LoadingPaymentElement accordion={smallScreen} onComplete={setPaymentComplete} />
            <PayButton />
        </Box>
    );
};

export default CompactLayout;
