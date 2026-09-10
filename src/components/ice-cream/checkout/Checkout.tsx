import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";

import axios from "axios";
import { validate } from "email-validator";
import {
    Box,
    Button,
    Divider,
    Grid,
    Link,
    TextField,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import { type Appearance, loadStripe } from "@stripe/stripe-js";
import {
    CheckoutProvider,
    useCheckout,
    PaymentElement,
    type StripeCheckoutValue
} from "@stripe/react-stripe-js/checkout";

import { API_URL } from "../../App";
import { decodeToken } from "../../../auth";
import { useAppContext } from "../../AppContext";
import { useIceCreamCart } from "../IceCreamCartContext";
import type { DatabaseFlavor } from "../../../../api/types";
import { rainbowTextSx } from "../IceCream";

const stripePublishableApiKey =
    "pk_live_51SSn4jGZZEzkLsbifOmvMvPB5xo33fgFS19ejvNuOibMMPHFu3ixt00c2nbCn4EPiIXWXvJvH1t3AZLXJE3dIrKz00aPsF6Dt2";
const stripeLoader = loadStripe(stripePublishableApiKey);

const Checkout = () => {
    const [searchParams] = useSearchParams();
    const { friendToken } = useAppContext();
    const priceIdsString = searchParams.get("priceIds") || "";
    const priceIdsArray = priceIdsString.split(",").filter(Boolean);
    const isSubscription = searchParams.get("subscription") === "true";
    const fetchClientSecret = useMemo(async () => {
        const result = isSubscription
            ? await axios.post(`${API_URL}/ice-cream/subscribe`, {})
            : await axios.post(`${API_URL}/ice-cream/checkout?priceIds=${priceIdsString}`);
        return result.data.client_secret;
    }, [priceIdsString, isSubscription]);

    if (!isSubscription && (!priceIdsString || priceIdsArray.length === 0)) {
        return <Navigate to={"/ice-cream"} replace />;
    }

    if (friendToken && !isSubscription) {
        return <FriendCheckoutForm priceIds={priceIdsArray} friendToken={friendToken} />;
    }

    const appearance: Appearance = {
        theme: "night",
        variables: {
            fontFamily: "Clacon",
            fontSizeBase: "22px",
            fontWeightNormal: "200",
            fontWeightMedium: "400",
            colorPrimary: "#52535F",
            colorPrimaryText: "#FFFFFF",
            colorBackground: "#1C1C1E",
            colorText: "#F9F9F9",
            borderRadius: "4px",
            spacingUnit: "4px"
        },
        rules: {
            ".Input": {
                fontFamily: "Clacon",
                fontSize: "22px",
                borderColor: "rgba(255,255,255,0.5)"
            },
            ".Input:focus": { borderColor: "#F9F9F9", boxShadow: "none" },
            ".Label": { fontFamily: "Clacon", fontSize: "18px", opacity: "0.7" },
            ".Tab": { fontFamily: "Clacon", borderColor: "rgba(255,255,255,0.5)" },
            ".Tab--selected": { borderColor: "#F9F9F9", color: "#F9F9F9" },
            ".AccordionItem": { fontFamily: "Clacon", borderColor: "rgba(255,255,255,0.5)" },
            ".Error": { fontFamily: "Clacon", fontSize: "18px" },
            ".Block": { borderColor: "rgba(255,255,255,0.5)" }
        }
    };

    return (
        <CheckoutProvider
            stripe={stripeLoader}
            options={{
                clientSecret: fetchClientSecret,
                elementsOptions: {
                    appearance,
                    fonts: [
                        { family: "Clacon", src: "url(https://maxrosoff.com/fonts/clacon.ttf)" }
                    ]
                }
            }}
        >
            <CheckoutForm priceIds={priceIdsArray} subscription={isSubscription} />
        </CheckoutProvider>
    );
};

const FriendCheckoutForm = ({
    priceIds,
    friendToken
}: {
    priceIds: string[];
    friendToken: string;
}) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("md"));
    const { flavors, loadFlavors } = useIceCreamCart();

    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        void loadFlavors();
    }, []);

    const selectedFlavors = flavors.filter((flavor) => priceIds.includes(flavor.priceId));

    const onSubmit = async () => {
        setIsLoading(true);
        setMessage(null);
        try {
            await axios.post(
                `${API_URL}/ice-cream/checkout?priceIds=${priceIds.join(",")}`,
                { email },
                { headers: { Authorization: `Bearer ${friendToken}` } }
            );
            navigate("/ice-cream/checkout/return");
        } catch (err) {
            setMessage("Checkout Failed");
            setIsLoading(false);
        }
    };

    const friendName = decodeToken(friendToken)?.id;
    return (
        <Box pb={4}>
            <Typography variant={"h1"} mb={2}>
                Checkout
            </Typography>
            <Typography variant={"body1"} mb={4}>
                Thanks for being a friend,{" "}
                <Typography component={"span"} sx={{ fontSize: "inherit", ...rainbowTextSx }}>
                    {friendName}
                </Typography>
                . This one's on me.
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
                        {selectedFlavors.map((flavor, index) => (
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
                                    <Typography sx={rainbowTextSx}>$0.00</Typography>
                                </Box>
                                {index < selectedFlavors.length - 1 && <Divider />}
                            </Box>
                        ))}
                    </Box>
                </Grid>
            </Grid>
            <Button
                color={"primary"}
                variant={"contained"}
                size={"large"}
                fullWidth
                disabled={isLoading || !email}
                loading={isLoading}
                onClick={onSubmit}
                sx={{
                    mt: 4,
                    fontSize: 20,
                    backgroundColor: "#52535F",
                    color: "white",
                    ":hover": { backgroundColor: "#5F6272" }
                }}
            >
                Complete Order
            </Button>
            {message && <Typography mt={2}>{message}</Typography>}
        </Box>
    );
};

const CheckoutForm = ({
    priceIds,
    subscription
}: {
    priceIds: string[];
    subscription: boolean;
}) => {
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
        const { isValid, message } = await validateEmail(email, state.checkout);
        if (!isValid) {
            setEmailError(message);
            setIsLoading(false);
            return;
        }

        if (subscription && (await alreadySubscribed(email))) {
            setEmailError("This email already has a subscription.");
            setIsLoading(false);
            return;
        }

        const confirmResult = await state.checkout.confirm();
        if (confirmResult.type === "error") {
            setMessage(confirmResult.error.message);
        }
        setIsLoading(false);
    };

    if (state.type === "error") {
        return (
            <Box pb={4}>
                <Typography variant={"h1"} mb={4}>
                    Checkout
                </Typography>
                <Typography>
                    Something went wrong starting checkout. Try again in a minute.
                </Typography>
                <Typography sx={{ mt: 1, fontSize: "0.9em", opacity: 0.6 }}>
                    {state.error.message}
                </Typography>
            </Box>
        );
    }

    const layoutProps = {
        selectedFlavors,
        subscription,
        isLoading,
        emailError,
        message,
        onSubmit
    };
    return selectedFlavors.length > 2 ? (
        <SidebarCheckoutLayout {...layoutProps} />
    ) : (
        <CompactCheckoutLayout {...layoutProps} />
    );
};

const alreadySubscribed = async (email: string): Promise<boolean> => {
    try {
        const result = await axios.post(`${API_URL}/ice-cream/subscription-status`, { email });
        return result.data.subscribed === true;
    } catch {
        return false;
    }
};

const lineItemAmount = (state: ReturnType<typeof useCheckout>, name: string): string => {
    if (state.type !== "success") {
        return "";
    }
    return state.checkout.lineItems.find((item) => item.name === name)?.unitAmount.amount ?? "";
};

const CompactCheckoutLayout = (props: {
    emailError: string | null;
    selectedFlavors: DatabaseFlavor[];
    subscription?: boolean;
    isLoading: boolean;
    message: string | null;
    onSubmit: (email: string) => void;
}) => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("md"));

    const state = useCheckout();

    const [email, setEmail] = useState("");
    const [manageResult, setManageResult] = useState<"sent" | "failed" | null>(null);

    const onManage = async () => {
        try {
            await axios.post(`${API_URL}/ice-cream/unsubscribe`, { email });
            setManageResult("sent");
        } catch {
            setManageResult("failed");
        }
    };

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
                    {props.subscription && (
                        <Typography mt={1.5} sx={{ fontSize: "0.9em", opacity: 0.7 }}>
                            {manageResult === "sent" ? (
                                "Check your email for a link."
                            ) : manageResult === "failed" ? (
                                "That did not go through. Try again in a minute."
                            ) : (
                                <Link
                                    component={"button"}
                                    onClick={onManage}
                                    disabled={!validate(email)}
                                    underline={validate(email) ? "hover" : "none"}
                                    sx={{
                                        color: "inherit",
                                        fontSize: "inherit",
                                        textAlign: "left",
                                        cursor: validate(email) ? "pointer" : "default",
                                        opacity: validate(email) ? 1 : 0.5
                                    }}
                                >
                                    Already subscribed? Email me a cancel link.
                                </Link>
                            )}
                        </Typography>
                    )}
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
                        {props.subscription &&
                            state.type === "success" &&
                            state.checkout.lineItems.map((item, index) => (
                                <Box key={item.id}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            py: 2
                                        }}
                                    >
                                        <Typography>{item.name}</Typography>
                                        <Typography>{item.total.amount}</Typography>
                                    </Box>
                                    {index < state.checkout.lineItems.length - 1 && <Divider />}
                                </Box>
                            ))}
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
                                    <Typography>{lineItemAmount(state, flavor.name)}</Typography>
                                </Box>
                                {index < props.selectedFlavors.length - 1 && <Divider />}
                            </Box>
                        ))}
                    </Box>
                </Grid>
            </Grid>
            <Typography
                variant={"h2"}
                mt={props.selectedFlavors.length != 2 ? 4 : smallScreen ? 2 : undefined}
                mb={2}
            >
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
                                    <Typography sx={{ fontSize: "1.2rem" }}>
                                        {lineItemAmount(state, flavor.name)}
                                    </Typography>
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
