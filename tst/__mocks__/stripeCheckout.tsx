import { beforeEach, vi } from "vitest";

type PaymentElementProps = {
    onReady: () => void;
    onChange: (event: { complete: boolean }) => void;
};

type CheckoutProviderProps = {
    options: { clientSecret: Promise<string> };
    children: React.ReactNode;
};

export const mockStripeCheckout = {
    state: { type: "loading" } as Record<string, unknown>,
    clientSecret: undefined as Promise<string> | undefined
};

export function mockCheckoutSession(overrides: Record<string, unknown> = {}) {
    const checkout = {
        lineItems: [
            {
                id: "li_1",
                name: "Fig",
                unitAmount: { amount: "$6.00" },
                total: { amount: "$6.00" }
            },
            {
                id: "li_2",
                name: "Monthly Pints",
                unitAmount: { amount: "$10.00" },
                total: { amount: "$10.00" }
            }
        ],
        total: { total: { amount: "$16.00" } },
        updateEmail: vi.fn(async () => ({ type: "success" })),
        updateBillingAddress: vi.fn(async () => ({ type: "success" })),
        confirm: vi.fn(async () => ({ type: "success" })),
        ...overrides
    };
    mockStripeCheckout.state = { type: "success", checkout };
    return checkout;
}

export function CheckoutProvider(props: CheckoutProviderProps) {
    mockStripeCheckout.clientSecret = props.options.clientSecret;
    return props.children;
}

export function useCheckout() {
    return mockStripeCheckout.state;
}

export function PaymentElement(props: PaymentElementProps) {
    return (
        <>
            <button onClick={props.onReady}>{"stripe ready"}</button>
            <button onClick={() => props.onChange({ complete: true })}>{"card complete"}</button>
        </>
    );
}

beforeEach(() => {
    mockStripeCheckout.state = { type: "loading" };
    mockStripeCheckout.clientSecret = undefined;
});
