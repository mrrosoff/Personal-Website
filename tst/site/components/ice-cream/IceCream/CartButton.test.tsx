import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithApp } from "../../../../helpers/render";

import CartButton from "../../../../../site/components/ice-cream/IceCream/CartButton";
import {
    IceCreamCartProvider,
    useIceCreamCart
} from "../../../../../site/components/ice-cream/IceCreamCartContext";

function Cart(props: { priceIds: string[] }) {
    const { toggleFlavor } = useIceCreamCart();
    return (
        <>
            <button onClick={() => props.priceIds.forEach(toggleFlavor)}>{"fill"}</button>
            <CartButton />
        </>
    );
}

describe("CartButton", () => {
    it("should show how many pints are in the cart and check them out", async () => {
        const { user } = renderWithApp(
            <IceCreamCartProvider>
                <Cart priceIds={["price_a", "price_b"]} />
            </IceCreamCartProvider>
        );
        await user.click(screen.getByText("fill"));

        await user.click(screen.getByLabelText("Checkout, 2 in cart"));

        expect(screen.getByTestId("location")).toHaveTextContent(
            "/ice-cream/checkout?priceIds=price_a,price_b"
        );
    });
});
