import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";

import axios from "axios";
import { validate } from "email-validator";
import {
    Box,
    Button,
    Divider,
    Grid,
    Link,
    Skeleton,
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
import type { StripeCheckoutContact } from "@stripe/stripe-js";

import { API_URL } from "../../App";
import FormField, { emailProblem } from "../../FormField";
import { decodeToken } from "../../../auth";
import { useAppContext } from "../../AppContext";
import { useIceCreamCart } from "../IceCreamCartContext";
import type { DatabaseFlavor } from "../../../../api/types";
import { rainbowTextSx } from "../IceCream";

const stripePublishableApiKey =
    "pk_live_51SSn4jGZZEzkLsbifOmvMvPB5xo33fgFS19ejvNuOibMMPHFu3ixt00c2nbCn4EPiIXWXvJvH1t3AZLXJE3dIrKz00aPsF6Dt2";
const stripeLoader = loadStripe(stripePublishableApiKey);

type DeliveryAddress = { line1: string; line2: string; postalCode: string };

const streetProblem = (street: string) =>
    /^\d+\s+\S/.test(street.trim()) ? null : "Enter a street address, like 1 Ferry Building.";
const zipProblem = (zip: string) => {
    if (zip.length < 5) {
        return "Enter a 5-digit ZIP.";
    }
    return zip.startsWith("941") ? null : "I only deliver within San Francisco.";
};

const isDeliverable = (address: DeliveryAddress) =>
    !streetProblem(address.line1) && !zipProblem(address.postalCode);

const toStripeContact = (address: DeliveryAddress): StripeCheckoutContact => ({
    address: {
        line1: address.line1.trim(),
        line2: address.line2.trim() || null,
        city: "San Francisco",
        state: "CA",
        postal_code: address.postalCode,
        country: "US"
    }
});

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
            <Typography variant={"body1"} mb={3}>
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
                    <FormField
                        label={"Email"}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        problem={emailProblem}
                        placeholder={"karl@fog.sf"}
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
                            px: smallScreen ? 2 : 3
                        }}
                    >
                        {selectedFlavors.map((flavor, index) => (
                            <Box key={flavor.priceId}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 2,
                                        alignItems: "center",
                                        py: smallScreen ? 1.5 : 2
                                    }}
                                >
                                    <Typography color={flavor.color || "white"} noWrap>
                                        {flavor.name}
                                    </Typography>
                                    <Typography sx={{ ...rainbowTextSx, flexShrink: 0 }}>
                                        $0.00
                                    </Typography>
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
                disabled={isLoading || !validate(email)}
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
    const [address, setAddress] = useState<DeliveryAddress>({
        line1: "",
        line2: "",
        postalCode: ""
    });
    const [message, setMessage] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [paymentComplete, setPaymentComplete] = useState(false);

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

        const addressResult = await state.checkout.updateBillingAddress(toStripeContact(address));
        if (addressResult.type === "error") {
            setMessage(addressResult.error.message);
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
                <Typography variant={"h1"} mb={3}>
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
        address,
        setAddress,
        paymentComplete,
        setPaymentComplete,
        onSubmit
    };
    return priceIds.length > 2 ? (
        <SidebarCheckoutLayout {...layoutProps} />
    ) : (
        <CompactCheckoutLayout {...layoutProps} />
    );
};

const DeliveryAddressFields = (props: {
    address: DeliveryAddress;
    setAddress: Dispatch<SetStateAction<DeliveryAddress>>;
}) => {
    const { address, setAddress } = props;
    return (
        <Grid container spacing={1.5} sx={{ mt: 1.5 }}>
            <Grid size={12}>
                <FormField
                    label={"Street Address"}
                    autoComplete={"address-line1"}
                    value={address.line1}
                    onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                    problem={streetProblem}
                    placeholder={"1 Ferry Building"}
                />
            </Grid>
            <Grid size={6}>
                <FormField
                    label={"Apt / Unit"}
                    autoComplete={"address-line2"}
                    value={address.line2}
                    onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                    placeholder={"Optional"}
                />
            </Grid>
            <Grid size={6}>
                <FormField
                    label={"ZIP"}
                    autoComplete={"postal-code"}
                    value={address.postalCode}
                    onChange={(e) =>
                        setAddress({
                            ...address,
                            postalCode: e.target.value.replace(/\D/g, "").slice(0, 5)
                        })
                    }
                    problem={zipProblem}
                    placeholder={"94111"}
                    slotProps={{ htmlInput: { inputMode: "numeric" } }}
                />
            </Grid>
        </Grid>
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

const LoadingPaymentElement = (props: {
    accordion: boolean;
    onComplete: (complete: boolean) => void;
}) => {
    const [ready, setReady] = useState(false);
    return (
        <Box>
            {!ready && <PaymentSkeleton accordion={props.accordion} />}
            <Box sx={ready ? undefined : { height: 0, overflow: "hidden", visibility: "hidden" }}>
                <PaymentElement
                    onReady={() => setReady(true)}
                    onChange={(event) => props.onComplete(event.complete)}
                    options={{
                        layout: {
                            type: props.accordion ? "accordion" : "tabs",
                            defaultCollapsed: false
                        },
                        fields: { billingDetails: { address: "never" } }
                    }}
                />
            </Box>
        </Box>
    );
};

const skeletonSx = { bgcolor: "rgba(255,255,255,0.1)" };

const outlinedBoxSx = {
    border: 1,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: "4px",
    backgroundColor: "#1C1C1E"
};

const SkeletonField = (props: { flex: number }) => (
    <Box sx={{ flex: props.flex, minWidth: 0 }}>
        <Skeleton width={110} sx={{ ...skeletonSx, fontSize: 18, mb: 0.75 }} />
        <Box sx={{ ...outlinedBoxSx, height: 50 }} />
    </Box>
);

const PaymentSkeleton = (props: { accordion: boolean }) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {props.accordion ? (
            <SkeletonField flex={1} />
        ) : (
            <Box sx={{ display: "flex", gap: 1.5 }}>
                <Box sx={{ ...outlinedBoxSx, flex: 1, height: 74 }} />
                <Box sx={{ ...outlinedBoxSx, flex: 1, height: 74 }} />
            </Box>
        )}
        <Box sx={{ display: "flex", gap: 1.5 }}>
            {!props.accordion && <SkeletonField flex={2} />}
            <SkeletonField flex={1} />
            <SkeletonField flex={1} />
        </Box>
    </Box>
);

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
    address: DeliveryAddress;
    setAddress: Dispatch<SetStateAction<DeliveryAddress>>;
    paymentComplete: boolean;
    setPaymentComplete: (complete: boolean) => void;
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
            <Typography variant={"h1"} mb={3}>
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
                    <FormField
                        label={"Email"}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        problem={emailProblem}
                        placeholder={"karl@fog.sf"}
                        error={!!props.emailError}
                        helperText={props.emailError}
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
                    <DeliveryAddressFields address={props.address} setAddress={props.setAddress} />
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
                            px: smallScreen ? 2 : 3
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
                        {props.selectedFlavors.map((flavor, index) => (
                            <Box key={flavor.priceId}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 2,
                                        alignItems: "center",
                                        py: smallScreen ? 1.5 : 2
                                    }}
                                >
                                    <Typography color={flavor.color || "white"} noWrap>
                                        {flavor.name}
                                    </Typography>
                                    <Typography sx={{ flexShrink: 0 }}>
                                        {lineItemAmount(state, flavor.name) || (
                                            <Skeleton width={56} sx={skeletonSx} />
                                        )}
                                    </Typography>
                                </Box>
                                {index < props.selectedFlavors.length - 1 && <Divider />}
                            </Box>
                        ))}
                    </Box>
                </Grid>
            </Grid>
            <Typography variant={"h2"} mt={4} mb={2}>
                Payment
            </Typography>
            <LoadingPaymentElement accordion={smallScreen} onComplete={props.setPaymentComplete} />
            <Button
                color={"primary"}
                variant={"contained"}
                size={"large"}
                fullWidth
                type="submit"
                disabled={
                    props.isLoading ||
                    state.type === "loading" ||
                    !props.paymentComplete ||
                    !validate(email) ||
                    !isDeliverable(props.address)
                }
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
    address: DeliveryAddress;
    setAddress: Dispatch<SetStateAction<DeliveryAddress>>;
    paymentComplete: boolean;
    setPaymentComplete: (complete: boolean) => void;
    onSubmit: (email: string) => void;
}) => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("lg"));

    const state = useCheckout();

    const [email, setEmail] = useState("");

    return (
        <Box pb={4}>
            <Typography variant={"h1"} mb={3}>
                Checkout
            </Typography>
            <Grid
                container
                spacing={smallScreen ? 4 : 6}
                direction={smallScreen ? "column-reverse" : "row"}
            >
                <Grid size={{ xs: 12, md: 7 }}>
                    <Typography variant={"h2"} mb={2}>
                        Contact Info
                    </Typography>
                    <FormField
                        label={"Email"}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        problem={emailProblem}
                        placeholder={"karl@fog.sf"}
                        error={!!props.emailError}
                        helperText={props.emailError}
                    />
                    <DeliveryAddressFields address={props.address} setAddress={props.setAddress} />
                    <Typography variant={"h2"} mt={4} mb={2}>
                        Payment
                    </Typography>
                    <LoadingPaymentElement
                        accordion={smallScreen}
                        onComplete={props.setPaymentComplete}
                    />
                    <Button
                        color={"primary"}
                        variant={"contained"}
                        size={"large"}
                        fullWidth
                        type="submit"
                        disabled={
                            props.isLoading ||
                            state.type === "loading" ||
                            !props.paymentComplete ||
                            !validate(email) ||
                            !isDeliverable(props.address)
                        }
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
                <Grid size={{ xs: 12, md: 5 }} sx={{ minWidth: smallScreen ? undefined : 400 }}>
                    <Typography variant={"h2"} mb={2}>
                        Your Order
                    </Typography>
                    <Box
                        sx={{
                            border: 1,
                            borderColor: "rgba(255, 255, 255, 0.5)",
                            borderRadius: 1,
                            px: smallScreen ? 2 : 3
                        }}
                    >
                        {props.selectedFlavors.map((flavor, index) => (
                            <Box key={flavor.priceId}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 2,
                                        alignItems: "center",
                                        py: smallScreen ? 1.5 : 2
                                    }}
                                >
                                    <Typography
                                        color={flavor.color || "white"}
                                        noWrap
                                        sx={{ fontSize: smallScreen ? "1.2rem" : "1.5rem" }}
                                    >
                                        {flavor.name}
                                    </Typography>
                                    <Typography sx={{ fontSize: "1.2rem", flexShrink: 0 }}>
                                        {lineItemAmount(state, flavor.name) || (
                                            <Skeleton width={56} sx={skeletonSx} />
                                        )}
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
