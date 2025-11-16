import { useMemo, useState } from "react";

import axios from "axios";
import { Box, Button, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Appearance, loadStripe } from "@stripe/stripe-js";
import { CheckoutProvider, useCheckout, PaymentElement } from "@stripe/react-stripe-js/checkout";

import ClaconFont from "../../../assets/fonts/clacon.ttf";
import { API_URL } from "../../App";

const stripePublishableApiKey =
    "pk_live_51SSn4jGZZEzkLsbifOmvMvPB5xo33fgFS19ejvNuOibMMPHFu3ixt00c2nbCn4EPiIXWXvJvH1t3AZLXJE3dIrKz00aPsF6Dt2";
const stripeLoader = loadStripe(stripePublishableApiKey);

const CheckoutForm = () => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("md"));

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const state = useCheckout();

    const handleSubmit = async () => {
        if (state.type === "loading" || state.type === "error") {
            return;
        }

        setIsLoading(true);
        const confirmResult = await state.checkout.confirm();
        if (confirmResult.type === "error") {
            setMessage(confirmResult.error.message);
        }
        setIsLoading(false);
    };

    if (state.type === "error") {
        return <div>Error: {state.error.message}</div>;
    }

    return (
        <Box>
            <Typography variant={"h1"}>Checkout</Typography>
            <Typography variant={"h2"} mt={4} mb={2}>
                Contact Info
            </Typography>
            <TextField
                variant={"filled"}
                label={"Email"}
                fullWidth
                sx={{
                    backgroundColor: "#30313D",
                    borderRadius: 1.5,
                    borderColor: "#424353",
                    border: 1
                }}
            />
            <Typography variant={"h2"} mt={4} mb={2}>
                Payment
            </Typography>
            <PaymentElement
                options={{
                    layout: {
                        type: smallScreen ? "auto" : "tabs",
                        defaultCollapsed: false
                    }
                }}
            />
            <Button
                color={"primary"}
                variant={"contained"}
                disabled={isLoading || state.type === "loading"}
                sx={{ width: "100%", mt: 4 }}
                type="submit"
                loading={isLoading || state.type === "loading"}
                onClick={handleSubmit}
            >
                Pay {state.type === "success" ? state.checkout.total.total.amount : ""}
            </Button>
            {message && <Box>{message}</Box>}
        </Box>
    );
};

const Checkout = () => {
    const fetchClientSecret = useMemo(async () => {
        const result = await axios.post(`${API_URL}/checkout`);
        return result.data.client_secret;
    }, []);

    const appearance: Appearance = {
        theme: "night",
        variables: {
            fontFamily: "Clacon",
            fontSizeBase: "22px",
            fontWeightNormal: "200",
            fontWeightMedium: "400",
            colorPrimary: "#F9F9F9"
        }
    };

    return (
        <CheckoutProvider
            stripe={stripeLoader}
            options={{
                clientSecret: fetchClientSecret,
                elementsOptions: {
                    appearance,
                    fonts: [{ family: "Clacon", src: `url(${ClaconFont})` }]
                }
            }}
        >
            <CheckoutForm />
        </CheckoutProvider>
    );
};

export default Checkout;
