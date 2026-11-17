import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { mockSmallScreen, renderWithApp } from "../../../../../helpers/render";

import { LoadingPaymentElement } from "../../../../../../src/components/ice-cream/checkout/CheckoutForm/PaymentFields";

describe("LoadingPaymentElement", () => {
    it("should show card field skeletons until stripe is ready", async () => {
        const { user } = renderWithApp(
            <LoadingPaymentElement accordion={false} onComplete={vi.fn()} />
        );

        expect(document.querySelectorAll(".MuiSkeleton-root")).toHaveLength(3);
        await user.click(screen.getByText("stripe ready"));
        expect(document.querySelectorAll(".MuiSkeleton-root")).toHaveLength(0);
    });

    it("should show accordion skeletons on a small screen", () => {
        mockSmallScreen();

        renderWithApp(<LoadingPaymentElement accordion onComplete={vi.fn()} />);

        expect(document.querySelectorAll(".MuiSkeleton-root")).toHaveLength(3);
    });

    it("should say when the card is complete", async () => {
        const onComplete = vi.fn();
        const { user } = renderWithApp(
            <LoadingPaymentElement accordion={false} onComplete={onComplete} />
        );

        await user.click(screen.getByText("card complete"));

        expect(onComplete).toHaveBeenCalledWith(true);
    });
});
