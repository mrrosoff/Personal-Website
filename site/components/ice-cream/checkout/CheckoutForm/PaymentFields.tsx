import { useState } from "react";

import { validate } from "email-validator";
import { Box, Button, Skeleton, Typography } from "@mui/material";
import { PaymentElement, useCheckout } from "@stripe/react-stripe-js/checkout";

import { isDeliverable, useCheckoutForm } from "./CheckoutFormContext";

type LoadingPaymentElementProps = {
    accordion: boolean;
    onComplete: (complete: boolean) => void;
};

export const LoadingPaymentElement = (props: LoadingPaymentElementProps) => {
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
                        fields: { billingDetails: { address: "never" } },
                        terms: {
                            card: "never",
                            applePay: "never",
                            googlePay: "never",
                            cashapp: "never"
                        }
                    }}
                />
            </Box>
        </Box>
    );
};

export const skeletonSx = { bgcolor: "rgba(255,255,255,0.1)" };

const outlinedBoxSx = {
    border: 1,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: "4px",
    backgroundColor: "#1C1C1E"
};

type SkeletonFieldProps = { flex: number };

const SkeletonField = (props: SkeletonFieldProps) => (
    <Box sx={{ flex: props.flex, minWidth: 0 }}>
        <Skeleton width={110} sx={{ ...skeletonSx, fontSize: 18, mb: 0.75 }} />
        <Box sx={{ ...outlinedBoxSx, height: 50 }} />
    </Box>
);

type PaymentSkeletonProps = { accordion: boolean };

const PaymentSkeleton = (props: PaymentSkeletonProps) => (
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

export const PayButton = () => {
    const state = useCheckout();
    const { address, email, isLoading, message, onSubmit, paymentComplete } = useCheckoutForm();
    return (
        <>
            <Button
                color={"primary"}
                variant={"contained"}
                size={"large"}
                fullWidth
                type="submit"
                disabled={
                    !onSubmit ||
                    isLoading ||
                    !paymentComplete ||
                    !validate(email) ||
                    !isDeliverable(address)
                }
                loading={isLoading || !onSubmit}
                onClick={onSubmit}
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
            {message && <Typography>{message}</Typography>}
        </>
    );
};
