import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockCheckoutApi, renderCheckout } from "../../../../helpers/checkout";
import { mockToken } from "../../../../setup";
import { AxiosError, axiosPost } from "../../../../mocks/axios";
import { mockStripeCheckout } from "../../../../mocks/stripeCheckout";

import { UserType } from "../../../../../api/types";

beforeEach(mockCheckoutApi);

describe("Checkout", () => {
    it("should send an empty cart back to the shop", () => {
        renderCheckout("");

        expect(screen.getByTestId("location")).toHaveTextContent(/^\/ice-cream$/);
    });

    it("should ask stripe for a payment session", async () => {
        renderCheckout("?priceIds=price_Fig");

        await expect(mockStripeCheckout.clientSecret).resolves.toBe("secret");
        expect(axiosPost).toHaveBeenCalledWith(
            "https://api.maxrosoff.com/ice-cream/checkout?priceIds=price_Fig"
        );
    });

    it("should ask for a subscription session", async () => {
        renderCheckout("?subscription=true");

        await expect(mockStripeCheckout.clientSecret).resolves.toBe("secret");
        expect(axiosPost).toHaveBeenCalledWith("https://api.maxrosoff.com/ice-cream/subscribe", {});
    });

    it("should pass along why a session could not start", async () => {
        axiosPost.mockRejectedValue(
            new AxiosError("bad", "400", undefined, undefined, {
                data: { message: "Fig just sold out." }
            } as never)
        );

        renderCheckout("?priceIds=price_Fig");

        await expect(mockStripeCheckout.clientSecret).rejects.toThrow("Fig just sold out.");
    });

    it("should pass along any other failure", async () => {
        axiosPost.mockRejectedValue(new Error("offline"));

        renderCheckout("?priceIds=price_Fig");

        await expect(mockStripeCheckout.clientSecret).rejects.toThrow("offline");
    });

    it("should give a friend the free checkout", async () => {
        renderCheckout("?priceIds=price_Fig", await mockToken(UserType.FRIEND));

        expect(screen.getByRole("button", { name: "Complete Order" })).toBeInTheDocument();
    });

    it("should still charge a friend for a subscription", async () => {
        renderCheckout("?subscription=true", await mockToken(UserType.FRIEND));

        await waitFor(() => expect(screen.getByText("Payment")).toBeInTheDocument());
    });

    it("should use the test key in development", async () => {
        vi.stubEnv("MODE", "development");
        vi.resetModules();
        const { loadStripe } = await import("@stripe/stripe-js");

        await import("../../../../../site/components/ice-cream/checkout/Checkout");

        expect(loadStripe).toHaveBeenCalledWith(expect.stringMatching(/^pk_test_/));
    });
});
