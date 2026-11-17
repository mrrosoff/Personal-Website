import { createContext, useContext, useEffect, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

import axios from "axios";
import { useCheckoutElements } from "@stripe/react-stripe-js/checkout";
import type { StripeCheckoutElementsValue } from "@stripe/react-stripe-js/checkout";
import type { StripeCheckoutContact } from "@stripe/stripe-js";

import { API_ENDPOINT_URL } from "../../../../../api/types";
import type { DatabaseFlavor } from "../../../../../api/types";
import { useIceCreamCart } from "../../IceCreamCartContext";

export type DeliveryAddress = { line1: string; line2: string; postalCode: string };

export function streetProblem(street: string): string | null {
    return /^\d+\s+\S/.test(street.trim())
        ? null
        : "Enter a street address, like 1 Ferry Building.";
}

export function zipProblem(zip: string): string | null {
    if (zip.length < 5) {
        return "Enter a 5-digit ZIP.";
    }
    return zip.startsWith("941") ? null : "I only deliver within San Francisco.";
}

export function isDeliverable(address: DeliveryAddress): boolean {
    return !streetProblem(address.line1) && !zipProblem(address.postalCode);
}

export function toStripeContact(address: DeliveryAddress): StripeCheckoutContact {
    return {
        address: {
            line1: address.line1.trim(),
            line2: address.line2.trim() || null,
            city: "San Francisco",
            state: "CA",
            postal_code: address.postalCode,
            country: "US"
        }
    };
}

type PaymentStatus = { state: "idle" } | { state: "paying" } | { state: "failed"; message: string };

type CheckoutFormState = {
    selectedFlavors: DatabaseFlavor[];
    subscription: boolean;
    email: string;
    setEmail: (email: string) => void;
    emailError: string | null;
    payment: PaymentStatus;
    address: DeliveryAddress;
    setAddress: Dispatch<SetStateAction<DeliveryAddress>>;
    paymentComplete: boolean;
    setPaymentComplete: (complete: boolean) => void;
    onSubmit?: () => void;
};

const CheckoutFormContext = createContext<CheckoutFormState | undefined>(undefined);

async function alreadySubscribed(email: string): Promise<boolean> {
    try {
        const result = await axios.post<{ subscribed: boolean }>(
            `${API_ENDPOINT_URL}/ice-cream/subscription-status`,
            {
                email
            }
        );
        return result.data.subscribed;
    } catch {
        return false;
    }
}

type CheckoutFormProviderProps = {
    priceIds: string[];
    subscription: boolean;
    children: ReactNode;
};

export function CheckoutFormProvider({
    priceIds,
    subscription,
    children
}: CheckoutFormProviderProps) {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState<string | null>(null);
    const [address, setAddress] = useState<DeliveryAddress>({
        line1: "",
        line2: "",
        postalCode: ""
    });
    const [payment, setPayment] = useState<PaymentStatus>({ state: "idle" });
    const [paymentComplete, setPaymentComplete] = useState(false);

    const state = useCheckoutElements();
    const { flavors, loadFlavors } = useIceCreamCart();

    useEffect(() => {
        void loadFlavors();
    }, [loadFlavors]);

    async function pay(checkout: StripeCheckoutElementsValue): Promise<string | null> {
        const emailResult = await checkout.updateEmail(email);
        if (emailResult.type === "error") {
            setEmailError(emailResult.error.message);
            return null;
        }
        if (subscription && (await alreadySubscribed(email))) {
            setEmailError("This email already has a subscription.");
            return null;
        }
        const addressResult = await checkout.updateBillingAddress(toStripeContact(address));
        if (addressResult.type === "error") {
            return addressResult.error.message;
        }
        const confirmResult = await checkout.confirm();
        return confirmResult.type === "error" ? confirmResult.error.message : null;
    }

    async function submit(checkout: StripeCheckoutElementsValue): Promise<void> {
        setPayment({ state: "paying" });
        let message: string | null = null;
        try {
            message = await pay(checkout);
        } finally {
            setPayment(message ? { state: "failed", message } : { state: "idle" });
        }
    }

    return (
        <CheckoutFormContext.Provider
            value={{
                selectedFlavors: flavors.filter((flavor) => priceIds.includes(flavor.priceId)),
                subscription,
                email,
                setEmail,
                emailError,
                address,
                setAddress,
                payment,
                paymentComplete,
                setPaymentComplete,
                onSubmit: state.type === "success" ? () => void submit(state.checkout) : undefined
            }}
        >
            {children}
        </CheckoutFormContext.Provider>
    );
}

export function useCheckoutForm(): CheckoutFormState {
    const context = useContext(CheckoutFormContext);
    if (context === undefined) {
        throw new Error("useCheckoutForm must be used within CheckoutFormProvider");
    }
    return context;
}
