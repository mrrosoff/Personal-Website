import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { mockScreenWidth, renderWithApp } from "../../../helpers/render";

import IceCreamPage from "../../../../site/components/ice-cream/IceCreamPage";

function renderPage() {
    renderWithApp(
        <IceCreamPage title={"Unsubscribe"} subtitle={"Sorry to see you go."}>
            <button>{"Remove"}</button>
        </IceCreamPage>
    );
}

describe("IceCreamPage", () => {
    it("should frame the page's content with its title and the ice cream", () => {
        renderPage();

        expect(screen.getByRole("heading", { name: "Unsubscribe" })).toBeInTheDocument();
        expect(screen.getByText("Sorry to see you go.")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
        expect(screen.getByAltText("Ice Cream")).toHaveAttribute("width", "250");
    });

    it("should center and shrink everything on a small screen", () => {
        mockScreenWidth(390);

        renderPage();

        expect(screen.getByAltText("Ice Cream")).toHaveAttribute("width", "150");
        expect(screen.getByRole("heading", { name: "Unsubscribe" })).toHaveClass(
            "MuiTypography-alignCenter"
        );
    });
});
