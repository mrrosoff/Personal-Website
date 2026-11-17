import { Box, Typography } from "@mui/material";
import { useCheckout } from "@stripe/react-stripe-js/checkout";

import { CheckoutFormProvider } from "./CheckoutForm/CheckoutFormContext";
import CompactLayout from "./CheckoutForm/CompactLayout";
import SidebarLayout from "./CheckoutForm/SidebarLayout";

type CheckoutFormProps = {
    priceIds: string[];
    subscription: boolean;
};

const CheckoutForm = ({ priceIds, subscription }: CheckoutFormProps) => {
    const state = useCheckout();

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

    return (
        <CheckoutFormProvider priceIds={priceIds} subscription={subscription}>
            {priceIds.length > 3 ? <SidebarLayout /> : <CompactLayout />}
        </CheckoutFormProvider>
    );
};

export default CheckoutForm;
