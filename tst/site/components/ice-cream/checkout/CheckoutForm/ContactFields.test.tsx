import { act, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fillInCheckout, mockCheckoutApi, renderCheckout } from "../../../../../helpers/checkout";
import { mockCheckoutSession } from "../../../../../mocks/stripeCheckout";

beforeEach(mockCheckoutApi);

describe("ContactFields", () => {
    it("should explain an address outside the city", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        mockCheckoutSession();
        const { user } = renderCheckout("?priceIds=price_Fig");

        await user.type(screen.getByLabelText("Street Address"), "Ferry");
        await user.type(screen.getByLabelText("ZIP"), "9a0210");
        await act(() => vi.advanceTimersByTimeAsync(600));

        expect(
            screen.getByText("Enter a street address, like 1 Ferry Building.")
        ).toBeInTheDocument();
        expect(screen.getByText("I only deliver within San Francisco.")).toBeInTheDocument();
        expect(screen.getByLabelText("ZIP")).toHaveValue("90210");
        vi.useRealTimers();
    });

    it("should ask for a whole ZIP", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        mockCheckoutSession();
        const { user } = renderCheckout("?priceIds=price_Fig");

        await user.type(screen.getByLabelText("ZIP"), "941");
        await act(() => vi.advanceTimersByTimeAsync(600));

        expect(screen.getByText("Enter a 5-digit ZIP.")).toBeInTheDocument();
        vi.useRealTimers();
    });

    it("should send an apartment along with the address", async () => {
        const checkout = mockCheckoutSession();
        const { user } = renderCheckout("?priceIds=price_Fig");
        await fillInCheckout(user);

        await user.type(screen.getByLabelText("Apt / Unit"), "4");
        await user.click(screen.getByRole("button", { name: /Pay/ }));

        expect(checkout.updateBillingAddress).toHaveBeenCalledWith({
            address: {
                line1: "1 Ferry Building",
                line2: "4",
                city: "San Francisco",
                state: "CA",
                postal_code: "94111",
                country: "US"
            }
        });
    });
});
