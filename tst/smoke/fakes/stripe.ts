import type { Page } from "@playwright/test";

export type FakeLineItem = { name: string; amount: string };

export type FakeStripeOptions = {
    lineItems: FakeLineItem[];
    total: string;
};

export async function fakeStripe(page: Page, options: FakeStripeOptions) {
    await page.route("https://*.stripe.com/**", (route) => route.fulfill({ status: 204 }));
    await page.route("https://js.stripe.com/**", (route) =>
        route.fulfill({ contentType: "application/javascript", body: stripeScript(options) })
    );
}

function stripeScript(options: FakeStripeOptions): string {
    return `(${String(installFakeStripe)})(${JSON.stringify(options)});`;
}

function installFakeStripe(options: FakeStripeOptions) {
    const ok = { type: "success" };
    const session = {
        lineItems: options.lineItems.map((item) => ({
            name: item.name,
            unitAmount: { amount: item.amount },
            total: { amount: item.amount }
        })),
        total: { total: { amount: options.total } }
    };

    function paymentElement() {
        const listeners = new Map<string, (event: object) => void>();
        return {
            on: (name: string, listener: (event: object) => void) => listeners.set(name, listener),
            off: (name: string) => listeners.delete(name),
            update: () => undefined,
            destroy: () => undefined,
            mount: (node: HTMLElement) => {
                const button = document.createElement("button");
                button.type = "button";
                button.textContent = "Enter Test Card";
                button.onclick = () => listeners.get("change")?.({ complete: true });
                node.appendChild(button);
                setTimeout(() => listeners.get("ready")?.({}), 0);
            }
        };
    }

    const actions = {
        getSession: () => session,
        updateEmail: () => Promise.resolve(ok),
        updateBillingAddress: () => Promise.resolve(ok),
        confirm: () => {
            window.location.assign("/ice-cream/checkout/return?sessionId=cs_test");
            return new Promise(() => undefined);
        }
    };

    const stripe = {
        version: 3,
        elements: () => ({}),
        createToken: () => undefined,
        createPaymentMethod: () => undefined,
        confirmCardPayment: () => undefined,
        registerAppInfo: () => undefined,
        _registerWrapper: () => undefined,
        initCheckoutElementsSdk: (sdkOptions: { clientSecret: Promise<string> | string }) => ({
            on: () => undefined,
            loadFonts: () => undefined,
            changeAppearance: () => undefined,
            loadActions: () =>
                Promise.resolve(sdkOptions.clientSecret).then(
                    () => ({ type: "success", actions }),
                    (error: unknown) => ({
                        type: "error",
                        error: { message: error instanceof Error ? error.message : String(error) }
                    })
                ),
            createPaymentElement: paymentElement
        })
    };

    Object.assign(window, { Stripe: () => stripe });
}
