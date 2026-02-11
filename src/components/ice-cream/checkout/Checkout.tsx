import { useEffect, useMemo, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";

import axios from "axios";
import {
    Box,
    Button,
    Divider,
    Grid,
    TextField,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import { Appearance, loadStripe } from "@stripe/stripe-js";
import {
    CheckoutProvider,
    useCheckout,
    PaymentElement,
    StripeCheckoutValue
} from "@stripe/react-stripe-js/checkout";

import { API_URL } from "../../App";
import { useIceCreamCart } from "../IceCreamCartContext";
import { DatabaseFlavor } from "../../../../api/types";

const stripePublishableApiKey =
    "pk_live_51SSn4jGZZEzkLsbifOmvMvPB5xo33fgFS19ejvNuOibMMPHFu3ixt00c2nbCn4EPiIXWXvJvH1t3AZLXJE3dIrKz00aPsF6Dt2";
const stripeLoader = loadStripe(stripePublishableApiKey);

const Checkout = () => {
    const [searchParams] = useSearchParams();
    const priceIdsString = searchParams.get("priceIds") || "";
    const priceIdsArray = priceIdsString.split(",").filter(Boolean);

    const fetchClientSecret = useMemo(async () => {
        const result = await axios.post(`${API_URL}/ice-cream/checkout?priceIds=${priceIdsString}`);
        return result.data.client_secret;
    }, [priceIdsString]);

    if (!priceIdsString || priceIdsArray.length === 0) {
        return <Navigate to={"/ice-cream"} replace />;
    }

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
                    fonts: [{ family: "Clacon", src: "url(https://maxrosoff.com/fonts/clacon.ttf)" }]
                }
            }}
        >
            <CheckoutForm priceIds={priceIdsArray} />
        </CheckoutProvider>
    );
};

const CheckoutForm = ({ priceIds }: { priceIds: string[] }) => {
    const [emailError, setEmailError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    const state = useCheckout();
    const { flavors, loadFlavors } = useIceCreamCart();

    useEffect(() => {
        void loadFlavors();
    }, []);

    const selectedFlavors = flavors.filter((flavor) => priceIds.includes(flavor.priceId));

    const validateEmail = async (email: string, checkout: StripeCheckoutValue) => {
        const updateResult = await checkout.updateEmail(email);
        const isValid = updateResult.type !== "error";

        return { isValid, message: !isValid ? updateResult.error.message : null };
    };

    const onSubmit = async (email: string) => {
        if (state.type === "loading" || state.type === "error") {
            return;
        }

        setIsLoading(true);
        const { checkout } = state;
        const { isValid, message } = await validateEmail(email, checkout);
        if (!isValid) {
            setEmailError(message);
        }

        const confirmResult = await state.checkout.confirm();
        if (confirmResult.type === "error") {
            setMessage(confirmResult.error.message);
        }
        setIsLoading(false);
    };

    if (state.type === "error") {
        return <Box>Error: {state.error.message}</Box>;
    }

    const layoutProps = { selectedFlavors, isLoading, emailError, message, onSubmit };
    return selectedFlavors.length > 2 ? (
        <SidebarCheckoutLayout {...layoutProps} />
    ) : (
        <CompactCheckoutLayout {...layoutProps} />
    );
};

const CompactCheckoutLayout = (props: {
    emailError: string | null;
    selectedFlavors: DatabaseFlavor[];
    isLoading: boolean;
    message: string | null;
    onSubmit: (email: string) => void;
}) => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("md"));

    const state = useCheckout();

    const [email, setEmail] = useState("");

    return (
        <Box pb={4}>
            <Typography variant={"h1"} mb={4}>
                Checkout
            </Typography>
            <Grid
                container
                spacing={smallScreen ? 4 : 2}
                direction={smallScreen ? "column-reverse" : "row"}
            >
                <Grid size={{ xs: 12, md: 6 }} sx={{ pr: smallScreen ? 0 : 10 }}>
                    <Typography variant={"h2"} mb={2}>
                        Contact Info
                    </Typography>
                    <TextField
                        variant={"filled"}
                        label={"Email"}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={!!props.emailError}
                        helperText={props.emailError}
                        fullWidth
                        slotProps={{ inputLabel: { shrink: !!email } }}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant={"h2"} mb={2}>
                        Your Order
                    </Typography>
                    <Box
                        sx={{
                            border: 1,
                            borderColor: "rgba(255, 255, 255, 0.5)",
                            borderRadius: 1,
                            px: 3
                        }}
                    >
                        {props.selectedFlavors.map((flavor, index) => (
                            <Box key={flavor.priceId}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        py: 2
                                    }}
                                >
                                    <Typography color={flavor.color || "white"}>
                                        {flavor.name}
                                    </Typography>
                                    <Typography>$5.00</Typography>
                                </Box>
                                {index < props.selectedFlavors.length - 1 && <Divider />}
                            </Box>
                        ))}
                    </Box>
                </Grid>
            </Grid>
            <Typography variant={"h2"} mt={props.selectedFlavors.length != 2 ? 4 : undefined} mb={2}>
                Payment
            </Typography>
            <PaymentElement
                options={{
                    layout: {
                        type: smallScreen ? "accordion" : "tabs",
                        defaultCollapsed: false
                    }
                }}
            />
            <Button
                color={"primary"}
                variant={"contained"}
                size={"large"}
                fullWidth
                type="submit"
                disabled={props.isLoading || state.type === "loading" || !email}
                loading={props.isLoading || state.type === "loading"}
                onClick={() => props.onSubmit(email)}
                sx={{
                    mt: 4,
                    fontSize: 20,
                    backgroundColor: "#52535F",
                    color: "white",
                    ":hover": { backgroundColor: "#5F6272" }
                }}
            >
                Pay {state.type === "success" ? state.checkout.total.total.amount : ""}
            </Button>
            {props.message && <Typography>{props.message}</Typography>}
        </Box>
    );
};

const SidebarCheckoutLayout = (props: {
    emailError: string | null;
    selectedFlavors: DatabaseFlavor[];
    isLoading: boolean;
    message: string | null;
    onSubmit: (email: string) => void;
}) => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("lg"));

    const state = useCheckout();

    const [email, setEmail] = useState("");

    return (
        <Box pb={4}>
            <Typography variant={"h1"} mb={4}>
                Checkout
            </Typography>
            <Grid container spacing={6} direction={smallScreen ? "column-reverse" : "row"}>
                <Grid size={{ xs: 12, md: 7 }}>
                    <Typography variant={"h2"} mb={2}>
                        Contact Info
                    </Typography>
                    <TextField
                        variant={"filled"}
                        label={"Email"}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={!!props.emailError}
                        helperText={props.emailError}
                        fullWidth
                        slotProps={{ inputLabel: { shrink: !!email } }}
                    />
                    <Typography variant={"h2"} mt={4} mb={2}>
                        Payment
                    </Typography>
                    <PaymentElement
                        options={{
                            layout: {
                                type: smallScreen ? "accordion" : "tabs",
                                defaultCollapsed: false
                            }
                        }}
                    />
                    <Button
                        color={"primary"}
                        variant={"contained"}
                        size={"large"}
                        fullWidth
                        type="submit"
                        disabled={props.isLoading || state.type === "loading" || !email}
                        loading={props.isLoading || state.type === "loading"}
                        onClick={() => props.onSubmit(email)}
                        sx={{
                            mt: 4,
                            fontSize: 20,
                            backgroundColor: "#52535F",
                            color: "white",
                            ":hover": { backgroundColor: "#5F6272" }
                        }}
                    >
                        Pay {state.type === "success" ? state.checkout.total.total.amount : ""}
                    </Button>
                    {props.message && <Typography>{props.message}</Typography>}
                </Grid>
                <Grid size={{ xs: 12, md: 5 }} sx={{ minWidth: 400 }}>
                    <Typography variant={"h2"} mb={2}>
                        Your Order
                    </Typography>
                    <Box
                        sx={{
                            border: 1,
                            borderColor: "rgba(255, 255, 255, 0.5)",
                            borderRadius: 1,
                            px: 3
                        }}
                    >
                        {props.selectedFlavors.map((flavor, index) => (
                            <Box key={flavor.priceId}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        py: 2
                                    }}
                                >
                                    <Typography
                                        color={flavor.color || "white"}
                                        sx={{ fontSize: "1.5rem" }}
                                    >
                                        {flavor.name}
                                    </Typography>
                                    <Typography sx={{ fontSize: "1.2rem" }}>$5.00</Typography>
                                </Box>
                                {index < props.selectedFlavors.length - 1 && <Divider />}
                            </Box>
                        ))}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Checkout;
