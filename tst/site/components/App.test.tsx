import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { mockScreenWidth } from "../../helpers/render";

vi.mock("../../../site/components/app/Page", () => ({
    default: (props: { inputRef: { current: HTMLInputElement | null } }) => (
        <input aria-label="terminal" ref={props.inputRef} />
    ),
    LinksAndMenu: () => <nav>{"links"}</nav>
}));
vi.mock("../../../site/components/ice-cream/IceCream", () => ({ default: () => <p>{"shop"}</p> }));
vi.mock("../../../site/components/ice-cream/checkout/Checkout", () => ({
    default: () => <p>{"checkout"}</p>
}));
vi.mock("../../../site/components/ice-cream/checkout/Return", () => ({
    default: () => <p>{"return"}</p>
}));
vi.mock("../../../site/components/ice-cream/CancelSubscription", () => ({
    default: () => <p>{"cancel"}</p>
}));
vi.mock("../../../site/components/ice-cream/Unsubscribe", () => ({
    default: () => <p>{"unsubscribe"}</p>
}));
vi.mock("../../../site/components/ice-cream/MailingList", () => ({
    default: () => <p>{"mailing list"}</p>
}));
vi.mock("../../../site/components/polaroid/Polaroid", () => ({
    default: () => <p>{"polaroid"}</p>
}));
vi.mock("../../../site/components/RegisterFriend", () => ({ default: () => <p>{"register"}</p> }));
vi.mock("../../../site/components/SpotifyCallback", () => ({ default: () => <p>{"spotify"}</p> }));

import App from "../../../site/components/App";

function visit(path: string) {
    window.history.pushState({}, "", path);
    return render(<App />);
}

describe("App", () => {
    it.each([
        ["/ice-cream", "shop"],
        ["/ice-cream/checkout", "checkout"],
        ["/ice-cream/checkout/return", "return"],
        ["/ice-cream/cancel", "cancel"],
        ["/ice-cream/mailing-list/unsubscribe", "unsubscribe"],
        ["/ice-cream/mailing-list", "mailing list"],
        ["/polaroid", "polaroid"],
        ["/privacy-policy", "Privacy Policy"],
        ["/register-friend", "register"],
        ["/spotify/callback", "spotify"]
    ])("should show %s", async (path, text) => {
        visit(path);

        expect(await screen.findByText(text)).toBeInTheDocument();
    });

    it("should send unknown pages home", async () => {
        visit("/nowhere");

        expect(await screen.findByLabelText("terminal")).toBeInTheDocument();
        expect(window.location.pathname).toBe("/");
    });

    it("should focus the terminal when the page is clicked", async () => {
        visit("/");
        const terminal = await screen.findByLabelText("terminal");

        fireEvent.click(screen.getByRole("main"));

        expect(terminal).toHaveFocus();
    });

    it("should leave a text selection alone when clicked", async () => {
        visit("/");
        const terminal = await screen.findByLabelText("terminal");
        vi.spyOn(window, "getSelection").mockReturnValue({ isCollapsed: false } as Selection);

        fireEvent.click(screen.getByRole("main"));

        expect(terminal).not.toHaveFocus();
    });

    it("should not mind a click with nothing to focus", async () => {
        visit("/privacy-policy");
        await screen.findByText("Privacy Policy");

        fireEvent.click(screen.getByRole("main"));

        expect(document.activeElement).toBe(document.body);
    });

    it("should hide the links away from home on a small screen", async () => {
        mockScreenWidth(390);

        visit("/ice-cream");

        expect(await screen.findByText("shop")).toBeInTheDocument();
        expect(screen.queryByText("links")).not.toBeInTheDocument();
    });

    it("should drop the bottom padding on a short small screen", async () => {
        mockScreenWidth(390);
        visit("/");
        await screen.findByLabelText("terminal");

        act(() => {
            window.innerHeight = 500;
            window.dispatchEvent(new Event("resize"));
        });

        expect(screen.getByRole("main")).toHaveStyle({ paddingBottom: "0px" });
    });

    it("should follow the visual viewport when there is one", async () => {
        const viewport = Object.assign(new EventTarget(), { height: 900 });
        vi.stubGlobal("visualViewport", viewport);
        mockScreenWidth(390);
        visit("/");
        await screen.findByLabelText("terminal");

        act(() => {
            viewport.height = 400;
            viewport.dispatchEvent(new Event("resize"));
        });

        expect(screen.getByRole("main")).toHaveStyle({ paddingBottom: "0px" });
    });
});
