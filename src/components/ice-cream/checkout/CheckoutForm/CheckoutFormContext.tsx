import {
    createContext,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
    useContext,
    useEffect,
    useState
} from "react";

import axios from "axios";
import { useCheckout, type StripeCheckoutValue } from "@stripe/react-stripe-js/checkout";
import type { StripeCheckoutContact } from "@stripe/stripe-js";

import { API_ENDPOINT_URL, type DatabaseFlavor } from "../../../../../api/types";
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

type CheckoutFormState = {
    selectedFlavors: DatabaseFlavor[];
    subscription: boolean;
    email: string;
    setEmail: (email: string) => void;
    emailError: string | null;
    message: string | null;
    address: DeliveryAddress;
    setAddress: Dispatch<SetStateAction<DeliveryAddress>>;
    isLoading: boolean;
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
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentComplete, setPaymentComplete] = useState(false);

    const state = useCheckout();
    const { flavors, loadFlavors } = useIceCreamCart();

    useEffect(() => {
        void loadFlavors();
    }, []);

    async function pay(checkout: StripeCheckoutValue): Promise<void> {
        const emailResult = await checkout.updateEmail(email);
        if (emailResult.type === "error") {
            setEmailError(emailResult.error.message);
            return;
        }
        if (subscription && (await alreadySubscribed(email))) {
            setEmailError("This email already has a subscription.");
            return;
        }
        const addressResult = await checkout.updateBillingAddress(toStripeContact(address));
        if (addressResult.type === "error") {
            setMessage(addressResult.error.message);
            return;
        }
        const confirmResult = await checkout.confirm();
        if (confirmResult.type === "error") {
            setMessage(confirmResult.error.message);
        }
    }

    async function submit(checkout: StripeCheckoutValue): Promise<void> {
        setIsLoading(true);
        try {
            await pay(checkout);
        } finally {
            setIsLoading(false);
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
                message,
                address,
                setAddress,
                isLoading,
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
