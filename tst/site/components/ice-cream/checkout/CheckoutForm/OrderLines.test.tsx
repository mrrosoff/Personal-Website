import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { mockCheckoutFlavors } from "../../../../../helpers/checkout";
import { renderWithApp } from "../../../../../helpers/render";
import { mockCheckoutSession } from "../../../../../mocks/stripeCheckout";

import OrderLines from "../../../../../../site/components/ice-cream/checkout/CheckoutForm/OrderLines";

describe("OrderLines", () => {
    it("should price each flavor once stripe knows the price", () => {
        mockCheckoutSession();

        renderWithApp(<OrderLines flavors={mockCheckoutFlavors.slice(0, 2)} smallScreen={false} />);

        expect(screen.getByText("$6.00")).toBeInTheDocument();
        expect(document.querySelectorAll(".MuiSkeleton-root")).toHaveLength(1);
        expect(document.querySelectorAll("hr")).toHaveLength(1);
    });

    it("should hold every price while stripe loads", () => {
        renderWithApp(<OrderLines flavors={mockCheckoutFlavors.slice(0, 2)} smallScreen />);

        expect(document.querySelectorAll(".MuiSkeleton-root")).toHaveLength(2);
    });
});
