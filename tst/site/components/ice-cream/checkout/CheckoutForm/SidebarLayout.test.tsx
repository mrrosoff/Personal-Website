import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { mockCheckoutFlavors } from "../../../../../fixtures/checkout";
import { mockCheckoutApi, renderCheckout } from "../../../../../helpers/checkout";
import { mockSmallScreen } from "../../../../../helpers/render";
import { mockCheckoutSession } from "../../../../../mocks/stripeCheckout";

const bigOrder = `?priceIds=${mockCheckoutFlavors.map((f) => f.priceId).join(",")}`;

beforeEach(mockCheckoutApi);

describe("SidebarLayout", () => {
    it("should list a big order beside the payment form", async () => {
        mockCheckoutSession();

        renderCheckout(bigOrder);

        expect(await screen.findByText("Kiwi")).toBeInTheDocument();
        expect(screen.getByText("$6.00")).toBeInTheDocument();
    });

    it("should stack on a smaller screen", async () => {
        mockSmallScreen();
        mockCheckoutSession();

        renderCheckout(bigOrder);

        expect(await screen.findByText("Kiwi")).toBeInTheDocument();
        expect(screen.getAllByRole("heading", { name: "Your Order" })).toHaveLength(1);
    });
});
