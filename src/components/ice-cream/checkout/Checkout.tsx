import { ChangeEvent, Dispatch, FormEvent, SetStateAction, useMemo, useState } from "react";

import axios from "axios";
import { Box, TextField, Typography } from "@mui/material";
import {
    Appearance,
    loadStripe,
    StripeExpressCheckoutElementConfirmEvent
} from "@stripe/stripe-js";
import {
    CheckoutProvider,
    ExpressCheckoutElement,
    PaymentElement,
    StripeCheckoutValue,
    useCheckout
} from "@stripe/react-stripe-js/checkout";

import ClaconFont from "../../../assets/fonts/clacon.ttf";
import { API_URL } from "../../App";

const stripePublishableApiKey =
    "pk_live_51SSn4jGZZEzkLsbifOmvMvPB5xo33fgFS19ejvNuOibMMPHFu3ixt00c2nbCn4EPiIXWXvJvH1t3AZLXJE3dIrKz00aPsF6Dt2";
const stripeLoader = loadStripe(stripePublishableApiKey);

const validateEmail = async (email: string, checkout: StripeCheckoutValue) => {
    const updateResult = await checkout.updateEmail(email);
    const isValid = updateResult.type !== "error";

    return { isValid, message: !isValid ? updateResult.error.message : null };
};

type EmailInputProps = {
    email: string;
    setEmail: Dispatch<SetStateAction<string>>;
    error: string | null;
    setError: Dispatch<SetStateAction<string | null>>;
};

const EmailInput = (props: EmailInputProps) => {
    const state = useCheckout();
    if (state.type === "loading" || state.type === "error") {
        return;
    }

    const handleBlur = async () => {
        if (!props.email) {
            return;
        }

        const { isValid, message } = await validateEmail(props.email, state.checkout);
        if (!isValid) {
            props.setError(message);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        props.setError(null);
        props.setEmail(e.target.value);
    };

    return (
        <Box display={"flex"}>
            <Typography>Email</Typography>
            <TextField
                type="text"
                value={props.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!props.error}
            />
            {props.error && <Typography>{props.error}</Typography>}
        </Box>
    );
};

const CheckoutForm = () => {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const state = useCheckout();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (state.type === "loading" || state.type === "error") {
            return;
        }

        setIsLoading(true);

        const { isValid, message } = await validateEmail(email, state.checkout);
        if (!isValid) {
            setEmailError(message);
            setMessage(message);
            setIsLoading(false);
            return;
        }

        const confirmResult = await state.checkout.confirm();

        // This point will only be reached if there is an immediate error when
        // confirming the payment. Otherwise, your customer will be redirected to
        // your `return_url`. For some payment methods like iDEAL, your customer will
        // be redirected to an intermediate site first to authorize the payment, then
        // redirected to the `return_url`.
        if (confirmResult.type === "error") {
            setMessage(confirmResult.error.message);
        }

        setIsLoading(false);
    };

    if (state.type === "error") {
        return <div>Error: {state.error.message}</div>;
    }

    return (
        <>
            <h2>Checkout</h2>
            <ExpressCheckoutElement
                options={{
                    buttonHeight: 44,
                    buttonTheme: {
                        applePay: "white-outline",
                        googlePay: "white",
                        paypal: "white"
                    },
                    buttonType: {
                        applePay: "plain",
                        googlePay: "plain",
                        paypal: "pay"
                    },
                    layout: {},
                    paymentMethods: {
                        applePay: "always",
                        googlePay: "always"
                    },
                    paymentMethodOrder: []
                }}
                onConfirm={(event: StripeExpressCheckoutElementConfirmEvent) => {
                    throw new Error("Function not implemented.");
                }}
            />
            <Typography>Or</Typography>
            <form onSubmit={handleSubmit}>
                <EmailInput
                    email={email}
                    setEmail={setEmail}
                    error={emailError}
                    setError={setEmailError}
                />
                <PaymentElement
                    options={{
                        layout: { type: "tabs", defaultCollapsed: false }
                    }}
                />
                <button disabled={isLoading} id="submit">
                    {isLoading || state.type === "loading" ? (
                        <div className="spinner"></div>
                    ) : (
                        `Pay ${state.checkout.total.total.amount} now`
                    )}
                </button>
                {/* Show any error or success messages */}
                {message && <div id="payment-message">{message}</div>}
            </form>
        </>
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
            fontSizeBase: "22px"
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
