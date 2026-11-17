import { useMemo } from "react";
import { Navigate, useSearchParams } from "react-router-dom";

import axios, { isAxiosError } from "axios";
import { loadStripe } from "@stripe/stripe-js";
import type { Appearance } from "@stripe/stripe-js";
import { CheckoutElementsProvider } from "@stripe/react-stripe-js/checkout";

import { API_ENDPOINT_URL } from "../../../../api/types";
import type { ErrorResponseBody } from "../../../../api/types";
import { useAppContext } from "../../AppContext";
import CheckoutForm from "./CheckoutForm";
import FriendCheckout from "./FriendCheckout";
import { COLORS, FONT } from "../../../theme";

const stripePublishableApiKey =
    import.meta.env.MODE === "development"
        ? "pk_test_51UYDYnGe1b8yeIzK2MB5YOyWJXNE6OGW4qazbsCSHMVLPD2wR11ObTwtYOI8UaKEDClMmo8OwHm23EtyjrnyLDeV0087bqHmhc"
        : "pk_live_51SSn4jGZZEzkLsbifOmvMvPB5xo33fgFS19ejvNuOibMMPHFu3ixt00c2nbCn4EPiIXWXvJvH1t3AZLXJE3dIrKz00aPsF6Dt2";
const stripeLoader = loadStripe(stripePublishableApiKey);

async function fetchClientSecret(isSubscription: boolean, priceIdsString: string): Promise<string> {
    try {
        const result = isSubscription
            ? await axios.post<{ client_secret: string }>(
                  `${API_ENDPOINT_URL}/ice-cream/subscribe`,
                  {}
              )
            : await axios.post<{ client_secret: string }>(
                  `${API_ENDPOINT_URL}/ice-cream/checkout?priceIds=${priceIdsString}`
              );
        return result.data.client_secret;
    } catch (error) {
        if (isAxiosError<ErrorResponseBody>(error) && error.response?.data.message) {
            throw new Error(error.response.data.message, { cause: error });
        }
        throw error;
    }
}

const APPEARANCE: Appearance = {
    theme: "night",
    variables: {
        fontFamily: FONT.family,
        fontSizeBase: "22px",
        fontWeightNormal: "200",
        fontWeightMedium: "400",
        colorPrimary: COLORS.button,
        colorPrimaryText: COLORS.white,
        colorBackground: COLORS.surface,
        colorText: COLORS.light,
        borderRadius: "4px",
        spacingUnit: "4px"
    },
    rules: {
        ".Input": {
            fontFamily: FONT.family,
            fontSize: "22px",
            borderColor: COLORS.muted
        },
        ".Input:focus": { borderColor: COLORS.light, boxShadow: "none" },
        ".Label": { fontFamily: FONT.family, fontSize: "18px", opacity: "0.7" },
        ".Tab": { fontFamily: FONT.family, borderColor: COLORS.muted },
        ".Tab--selected": { borderColor: COLORS.light, color: COLORS.light },
        ".AccordionItem": { fontFamily: FONT.family, borderColor: COLORS.muted },
        ".Error": { fontFamily: FONT.family, fontSize: "18px" },
        ".Block": { borderColor: COLORS.muted }
    }
};

type PaidCheckoutProps = { priceIdsString: string; subscription: boolean };

function PaidCheckout({ priceIdsString, subscription }: PaidCheckoutProps) {
    const clientSecret = useMemo(
        () => fetchClientSecret(subscription, priceIdsString),
        [subscription, priceIdsString]
    );

    return (
        <CheckoutElementsProvider
            stripe={stripeLoader}
            options={{
                clientSecret,
                elementsOptions: {
                    appearance: APPEARANCE,
                    fonts: [{ family: FONT.family, src: `url(${FONT.url})` }]
                }
            }}
        >
            <CheckoutForm
                priceIds={priceIdsString.split(",").filter(Boolean)}
                subscription={subscription}
            />
        </CheckoutElementsProvider>
    );
}

const Checkout = () => {
    const [searchParams] = useSearchParams();
    const { friendToken } = useAppContext();
    const priceIdsString = searchParams.get("priceIds") ?? "";
    const priceIdsArray = priceIdsString.split(",").filter(Boolean);
    const isSubscription = searchParams.get("subscription") === "true";

    if (!isSubscription && priceIdsArray.length === 0) {
        return <Navigate to={"/ice-cream"} replace />;
    }

    if (friendToken && !isSubscription) {
        return <FriendCheckout priceIds={priceIdsArray} friendToken={friendToken} />;
    }

    return <PaidCheckout priceIdsString={priceIdsString} subscription={isSubscription} />;
};

export default Checkout;
