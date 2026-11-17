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

const Checkout = () => {
    const [searchParams] = useSearchParams();
    const { friendToken } = useAppContext();
    const priceIdsString = searchParams.get("priceIds") ?? "";
    const priceIdsArray = priceIdsString.split(",").filter(Boolean);
    const isSubscription = searchParams.get("subscription") === "true";
    const clientSecret = useMemo(
        () => fetchClientSecret(isSubscription, priceIdsString),
        [isSubscription, priceIdsString]
    );

    if (!isSubscription && (!priceIdsString || priceIdsArray.length === 0)) {
        return <Navigate to={"/ice-cream"} replace />;
    }

    if (friendToken && !isSubscription) {
        return <FriendCheckout priceIds={priceIdsArray} friendToken={friendToken} />;
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
        <CheckoutElementsProvider
            stripe={stripeLoader}
            options={{
                clientSecret,
                elementsOptions: {
                    appearance,
                    fonts: [
                        { family: "Clacon", src: "url(https://maxrosoff.com/fonts/clacon.ttf)" }
                    ]
                }
            }}
        >
            <CheckoutForm priceIds={priceIdsArray} subscription={isSubscription} />
        </CheckoutElementsProvider>
    );
};

export default Checkout;
