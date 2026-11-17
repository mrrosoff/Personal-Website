import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockCheckoutFlavors } from "../../../../__mocks__/__data__/checkout";
import { fillInCheckout, mockCheckoutApi, renderCheckout } from "../../../../helpers/checkout";
import { axiosPost } from "../../../../__mocks__/axios";
import { mockCheckoutSession, mockStripeCheckout } from "../../../../__mocks__/stripeCheckout";

beforeEach(mockCheckoutApi);

describe("CheckoutForm", () => {
    it("should explain when stripe fails to start", () => {
        mockStripeCheckout.state = { type: "error", error: { message: "Fig just sold out." } };

        renderCheckout("?priceIds=price_Fig");

        expect(screen.getByText(/Something went wrong starting checkout/)).toBeInTheDocument();
        expect(screen.getByText("Fig just sold out.")).toBeInTheDocument();
    });

    it("should pay with the delivery address", async () => {
        const checkout = mockCheckoutSession();
        const { user } = renderCheckout("?priceIds=price_Fig");
        await fillInCheckout(user);

        await user.click(screen.getByRole("button", { name: "Pay $16.00" }));

        expect(checkout.updateEmail).toHaveBeenCalledWith("ada@example.com");
        expect(checkout.updateBillingAddress).toHaveBeenCalledWith({
            address: {
                line1: "1 Ferry Building",
                line2: null,
                city: "San Francisco",
                state: "CA",
                postal_code: "94111",
                country: "US"
            }
        });
        expect(checkout.confirm).toHaveBeenCalled();
    });

    it("should show stripe's complaint about the email", async () => {
        mockCheckoutSession({
            updateEmail: vi.fn(() =>
                Promise.resolve({ type: "error", error: { message: "Bad email" } })
            )
        });
        const { user } = renderCheckout("?priceIds=price_Fig");
        await fillInCheckout(user);

        await user.click(screen.getByRole("button", { name: /Pay/ }));

        expect(screen.getByText("Bad email")).toBeInTheDocument();
    });

    it("should show stripe's complaint about the address", async () => {
        mockCheckoutSession({
            updateBillingAddress: vi.fn(() =>
                Promise.resolve({
                    type: "error",
                    error: { message: "Bad address" }
                })
            )
        });
        const { user } = renderCheckout("?priceIds=price_Fig");
        await fillInCheckout(user);

        await user.click(screen.getByRole("button", { name: /Pay/ }));

        expect(screen.getByText("Bad address")).toBeInTheDocument();
    });

    it("should show why the payment failed", async () => {
        mockCheckoutSession({
            confirm: vi.fn(() =>
                Promise.resolve({ type: "error", error: { message: "Card declined" } })
            )
        });
        const { user } = renderCheckout("?priceIds=price_Fig");
        await fillInCheckout(user);

        await user.click(screen.getByRole("button", { name: /Pay/ }));

        expect(screen.getByText("Card declined")).toBeInTheDocument();
    });

    it("should refuse an email that already subscribes", async () => {
        const checkout = mockCheckoutSession();
        axiosPost.mockImplementation((url: string) =>
            Promise.resolve(
                url.endsWith("/subscription-status")
                    ? { data: { subscribed: true } }
                    : { data: { inventory: [] } }
            )
        );
        const { user } = renderCheckout("?subscription=true");
        await fillInCheckout(user);

        await user.click(screen.getByRole("button", { name: /Pay/ }));

        expect(screen.getByText("This email already has a subscription.")).toBeInTheDocument();
        expect(checkout.confirm).not.toHaveBeenCalled();
    });

    it("should carry on if the subscription check fails", async () => {
        const checkout = mockCheckoutSession();
        axiosPost.mockImplementation((url: string) =>
            url.endsWith("/subscription-status")
                ? Promise.reject(new Error("offline"))
                : Promise.resolve({ data: { inventory: [] } })
        );
        const { user } = renderCheckout("?subscription=true");
        await fillInCheckout(user);

        await user.click(screen.getByRole("button", { name: /Pay/ }));

        expect(checkout.confirm).toHaveBeenCalled();
    });

    it("should use the sidebar layout for more than three flavors", async () => {
        mockCheckoutSession();

        renderCheckout(`?priceIds=${mockCheckoutFlavors.map((f) => f.priceId).join(",")}`);

        expect(await screen.findByText("Kiwi")).toBeInTheDocument();
        expect(screen.queryByText(/Already subscribed/)).not.toBeInTheDocument();
    });
});
