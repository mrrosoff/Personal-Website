import axios from "axios";
import { useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";

import { API_URL } from "../../App";

const stripePublishableApiKey =
    "pk_live_51SSn4jGZZEzkLsbifOmvMvPB5xo33fgFS19ejvNuOibMMPHFu3ixt00c2nbCn4EPiIXWXvJvH1t3AZLXJE3dIrKz00aPsF6Dt2";
const stripeLoader = loadStripe(stripePublishableApiKey);

const Checkout = () => {
    const fetchClientSecret = useCallback(async () => {
        const result = await axios.post(`${API_URL}/checkout`);
        return result.data.clientSecret;
    }, []);

    return (
        <EmbeddedCheckoutProvider stripe={stripeLoader} options={{ fetchClientSecret }}>
            <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
    );
};

export default Checkout;
