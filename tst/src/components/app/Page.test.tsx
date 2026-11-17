import { act, screen } from "@testing-library/react";
import { createRef, useEffect } from "react";
import { describe, expect, it, vi } from "vitest";

import { mockSmallScreen, renderWithApp } from "../../../helpers/render";

import Page, { LinksAndMenu } from "../../../../src/components/app/Page";
import {
    IceCreamCartProvider,
    useIceCreamCart
} from "../../../../src/components/ice-cream/IceCreamCartContext";

const navigate = vi.hoisted(() => vi.fn());
vi.mock("react-router-dom", async (importOriginal) => ({
    ...(await importOriginal<typeof import("react-router-dom")>()),
    useNavigate: () => navigate
}));

function InCart(props: { priceIds: string[] }) {
    const { toggleFlavor } = useIceCreamCart();
    useEffect(() => {
        props.priceIds.forEach(toggleFlavor);
    }, []);
    return null;
}

function renderLinks(route: string, priceIds: string[] = []) {
    return renderWithApp(
        <IceCreamCartProvider>
            <InCart priceIds={priceIds} />
            <LinksAndMenu />
        </IceCreamCartProvider>,
        { route }
    );
}

describe("Page", () => {
    it("should show the terminal", () => {
        renderWithApp(<Page inputRef={createRef()} scrollContainerRef={createRef()} />);

        expect(screen.getByText(/Welcome To Rosoff OS/)).toBeInTheDocument();
    });

    it("should boot up first on a fresh visit", () => {
        vi.useFakeTimers();
        renderWithApp(<Page inputRef={createRef()} scrollContainerRef={createRef()} />, {
            shouldBootUp: true
        });

        expect(screen.getByText(/Released:/)).toBeInTheDocument();
        act(() => void vi.advanceTimersByTime(6400));
        expect(screen.getByText(/Welcome To Rosoff OS/)).toBeInTheDocument();
        vi.useRealTimers();
    });
});

describe("LinksAndMenu", () => {
    it("should link home to the shop", () => {
        renderLinks("/");

        expect(screen.getByText("Ice Cream")).toHaveAttribute("href", "/ice-cream");
    });

    it("should link checkout back to the shop", () => {
        renderLinks("/ice-cream/checkout");

        expect(screen.getByText("Ice Cream")).toHaveAttribute("href", "/ice-cream");
    });

    it("should link the shop home and show an empty cart", async () => {
        const { user } = renderLinks("/ice-cream");

        await user.click(screen.getByText("Cart (0)"));

        expect(screen.getByText("Home")).toHaveAttribute("href", "/");
        expect(navigate).not.toHaveBeenCalled();
    });

    it("should check out what is in the cart", async () => {
        const { user } = renderLinks("/ice-cream", ["price_a", "price_b"]);

        await user.click(screen.getByText("Cart (2)"));

        expect(navigate).toHaveBeenCalledWith("/ice-cream/checkout?priceIds=price_a,price_b");
    });

    it("should open the social links from More and the avatar", async () => {
        const { user } = renderLinks("/");

        await user.click(screen.getByText("More"));
        expect(screen.getByText("Résumé")).toBeInTheDocument();

        await user.click(screen.getByAltText("Max Rosoff"));
        expect(screen.queryByText("Résumé")).not.toBeInTheDocument();
    });

    it("should hide the text links on a small screen", () => {
        mockSmallScreen();

        renderLinks("/");

        expect(screen.queryByText("More")).not.toBeInTheDocument();
    });
});
