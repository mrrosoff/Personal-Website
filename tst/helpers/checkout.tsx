import { Route, Routes } from "react-router-dom";

import { screen } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";

import { mockFlavor } from "../mocks/aws/dynamodb";
import { axiosPost } from "../mocks/axios";
import { renderWithApp } from "./render";

import Checkout from "../../site/components/ice-cream/checkout/Checkout";
import { IceCreamCartProvider } from "../../site/components/ice-cream/IceCreamCartContext";

export const mockCheckoutFlavors = ["Fig", "Plum", "Yuzu", "Mint", "Kiwi"].map((name) => ({
    ...mockFlavor,
    productId: name,
    priceId: `price_${name}`,
    name,
    color: name === "Plum" ? "" : "pink"
}));

export function mockCheckoutApi() {
    axiosPost.mockImplementation((url: string) => {
        const data = url.endsWith("/ice-cream/inventory")
            ? { inventory: mockCheckoutFlavors }
            : { client_secret: "secret", subscribed: false };
        return Promise.resolve({ data });
    });
}

export function renderCheckout(search: string, friendToken?: string) {
    return renderWithApp(
        <IceCreamCartProvider>
            <Routes>
                <Route path="/ice-cream/checkout" element={<Checkout />} />
                <Route path="*" element={null} />
            </Routes>
        </IceCreamCartProvider>,
        { route: `/ice-cream/checkout${search}`, friendToken }
    );
}

export async function fillInCheckout(user: UserEvent, email = "ada@example.com") {
    await user.type(screen.getByLabelText("Email"), email);
    await user.type(screen.getByLabelText("Street Address"), "1 Ferry Building");
    await user.type(screen.getByLabelText("ZIP"), "94111");
    await user.click(screen.getByText("stripe ready"));
    await user.click(screen.getByText("card complete"));
}
