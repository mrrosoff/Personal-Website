import { act, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { mockSmallScreen, renderWithApp } from "../../../helpers/render";
import { axiosPost } from "../../../mocks/axios";
import { mockFlavor } from "../../../fixtures/aws/dynamodb";

import IceCream from "../../../../site/components/ice-cream/IceCream";
import { IceCreamCartProvider } from "../../../../site/components/ice-cream/IceCreamCartContext";
import type { DatabaseFlavor } from "../../../../api/types";

function flavor(name: string, type: DatabaseFlavor["type"], count = 3, color = "pink") {
    return { ...mockFlavor, productId: name, priceId: `price_${name}`, name, type, count, color };
}

const inventory = [
    flavor("Fig", "currentFlavor"),
    flavor("Sold Out", "currentFlavor", 0),
    flavor("Plum", "lastBatch", 1, ""),
    flavor("Yuzu", "upcoming")
];

function renderShop(options: { route?: string; friendToken?: string } = {}) {
    axiosPost.mockResolvedValue({ data: { inventory } });
    return renderWithApp(
        <IceCreamCartProvider>
            <IceCream />
        </IceCreamCartProvider>,
        { route: "/ice-cream", ...options }
    );
}

describe("IceCream", () => {
    it("should show skeletons while the freezer loads", () => {
        axiosPost.mockReturnValue(new Promise(() => undefined));
        renderWithApp(
            <IceCreamCartProvider>
                <IceCream />
            </IceCreamCartProvider>
        );

        expect(document.querySelectorAll(".MuiSkeleton-root")).toHaveLength(9);
    });

    it("should sort the flavors into their sections", async () => {
        renderShop();

        expect(await screen.findByText("Fig")).toBeInTheDocument();
        expect(screen.getByText("Plum")).toBeInTheDocument();
        expect(screen.getByText("Yuzu")).toBeInTheDocument();
        expect(screen.queryByText("Sold Out")).not.toBeInTheDocument();
    });

    it("should show prices to everyone else", () => {
        renderShop();

        expect(screen.getByText("$10 for two every month")).toHaveAttribute(
            "href",
            "/ice-cream/checkout?subscription=true"
        );
    });

    it("should tell friends it is on the house", () => {
        renderShop({ friendToken: "token" });

        expect(screen.getByText("on the house for friends of Max.")).toBeInTheDocument();
    });

    it("should say when the freezer cannot be checked", async () => {
        axiosPost.mockRejectedValue(new Error("offline"));
        renderWithApp(
            <IceCreamCartProvider>
                <IceCream />
            </IceCreamCartProvider>
        );

        expect(await screen.findByText(/FAILED/)).toBeInTheDocument();
    });

    it("should pick a flavor shared in the link", async () => {
        mockSmallScreen();
        renderShop({ route: "/ice-cream?flavor=price_Fig" });

        expect(await screen.findByLabelText("Checkout, 1 in cart")).toBeInTheDocument();
    });

    it("should pick and unpick flavors and check out on a small screen", async () => {
        mockSmallScreen();
        const { user } = renderShop();

        await user.click(await screen.findByText("Fig"));
        await user.click(screen.getByText("Plum"));
        await user.click(screen.getByText("Plum"));
        await user.click(screen.getByLabelText("Checkout, 1 in cart"));

        expect(screen.getByTestId("location")).toHaveTextContent(
            "/ice-cream/checkout?priceIds=price_Fig"
        );
    });

    it("should not pick upcoming flavors", async () => {
        mockSmallScreen();
        const { user } = renderShop();

        await user.click(await screen.findByText("Yuzu"));

        expect(screen.queryByLabelText(/in cart/)).not.toBeInTheDocument();
    });

    it("should let go of a shared flavor when leaving", async () => {
        mockSmallScreen();
        const { unmount } = renderShop({ route: "/ice-cream?flavor=price_Fig" });
        await screen.findByLabelText("Checkout, 1 in cart");

        act(() => unmount());

        await waitFor(() => expect(screen.queryByLabelText(/in cart/)).not.toBeInTheDocument());
    });
});
