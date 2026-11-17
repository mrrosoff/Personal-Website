import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { mockCheckoutApi, renderCheckout } from "../../../../../helpers/checkout";
import { mockSmallScreen } from "../../../../../helpers/render";
import { axiosPost } from "../../../../../__mocks__/axios";
import { mockCheckoutSession } from "../../../../../__mocks__/stripeCheckout";

beforeEach(mockCheckoutApi);

function manageLink() {
    return screen.getByRole("button", { name: /Already subscribed/ });
}

describe("CompactLayout", () => {
    it("should hold the pay button while stripe loads", async () => {
        renderCheckout("?priceIds=price_Fig,price_Plum");

        expect(await screen.findByText("Plum")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Pay/ })).toBeDisabled();
    });

    it("should list the plan and how it renews", () => {
        mockSmallScreen();
        mockCheckoutSession();

        renderCheckout("?subscription=true");

        expect(screen.getByText("Monthly Pints")).toBeInTheDocument();
        expect(screen.getByText(/Renews monthly at \$16.00/)).toBeInTheDocument();
    });

    it("should leave out the renewal until stripe is ready", () => {
        renderCheckout("?subscription=true");

        expect(screen.queryByText(/Renews monthly/)).not.toBeInTheDocument();
        expect(manageLink()).toHaveAttribute("aria-disabled", "true");
    });

    it("should email a cancel link to an existing subscriber", async () => {
        mockCheckoutSession();
        const { user } = renderCheckout("?subscription=true");
        await user.type(screen.getByLabelText("Email"), "ada@example.com");

        await user.click(manageLink());

        expect(axiosPost).toHaveBeenCalledWith("https://api.maxrosoff.com/ice-cream/unsubscribe", {
            email: "ada@example.com"
        });
        expect(screen.getByText(/Check your email for a link./)).toBeInTheDocument();
    });

    it("should send the cancel link with the enter key", async () => {
        mockCheckoutSession();
        const { user } = renderCheckout("?subscription=true");
        await user.type(screen.getByLabelText("Email"), "ada@example.com");

        fireEvent.keyDown(manageLink(), { key: "Enter" });

        expect(await screen.findByText(/Check your email for a link./)).toBeInTheDocument();
    });

    it("should ignore other keys on the cancel link", async () => {
        mockCheckoutSession();
        const { user } = renderCheckout("?subscription=true");
        await user.type(screen.getByLabelText("Email"), "ada@example.com");

        fireEvent.keyDown(manageLink(), { key: "a" });

        expect(manageLink()).toBeInTheDocument();
    });

    it("should not send a cancel link without an email", async () => {
        mockCheckoutSession();
        const { user } = renderCheckout("?subscription=true");

        await user.click(manageLink());
        fireEvent.keyDown(manageLink(), { key: "Enter" });

        expect(axiosPost).not.toHaveBeenCalledWith(
            "https://api.maxrosoff.com/ice-cream/unsubscribe",
            expect.anything()
        );
    });

    it("should say when the cancel link could not be sent", async () => {
        mockCheckoutSession();
        axiosPost.mockImplementation((url: string) =>
            url.endsWith("/ice-cream/unsubscribe")
                ? Promise.reject(new Error("offline"))
                : Promise.resolve({ data: { inventory: [] } })
        );
        const { user } = renderCheckout("?subscription=true");
        await user.type(screen.getByLabelText("Email"), "ada@example.com");

        await user.click(manageLink());

        expect(screen.getByText(/That did not go through/)).toBeInTheDocument();
    });
});
