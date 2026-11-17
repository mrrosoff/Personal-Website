import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";

import { axiosPost } from "../mocks/axios";
import { mockCheckoutFlavors } from "../fixtures/checkout";
import { renderWithApp } from "./render";

import Checkout from "../../site/components/ice-cream/checkout/Checkout";
import { IceCreamCartProvider } from "../../site/components/ice-cream/IceCreamCartContext";

export function mockCheckoutApi() {
    axiosPost.mockImplementation((url: string) =>
        Promise.resolve(
            url.endsWith("/ice-cream/inventory")
                ? { data: { inventory: mockCheckoutFlavors } }
                : { data: { client_secret: "secret", subscribed: false } }
        )
    );
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

export async function fillInCheckout(
    user: ReturnType<typeof renderWithApp>["user"],
    email = "ada@example.com"
) {
    await user.type(screen.getByLabelText("Email"), email);
    await user.type(screen.getByLabelText("Street Address"), "1 Ferry Building");
    await user.type(screen.getByLabelText("ZIP"), "94111");
    await user.click(screen.getByText("stripe ready"));
    await user.click(screen.getByText("card complete"));
}
