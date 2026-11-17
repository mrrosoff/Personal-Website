import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { mockSmallScreen, mockTerminalTheme, renderWithApp } from "../../../../helpers/render";

import MessageOfTheDay from "../../../../../site/components/terminal/Terminal/MessageOfTheDay";

describe("MessageOfTheDay", () => {
    it("should greet with links that open in a new tab", () => {
        renderWithApp(<MessageOfTheDay theme={mockTerminalTheme} />);

        expect(screen.getByText(/Welcome To Rosoff OS/)).toBeInTheDocument();
        expect(screen.getByText("me@maxrosoff.com")).toHaveAttribute(
            "href",
            "mailto:me@maxrosoff.com"
        );
        expect(screen.getByText("https://linkedin.com/in/max-rosoff")).toHaveAttribute(
            "target",
            "_blank"
        );
        expect(screen.queryByText(/Ice Cream:/)).not.toBeInTheDocument();
    });

    it("should link the shop and shorten links on a small screen", async () => {
        mockSmallScreen();
        const { user } = renderWithApp(<MessageOfTheDay theme={mockTerminalTheme} />);

        await user.click(screen.getByText("maxrosoff.com"));

        expect(screen.getByTestId("location")).toHaveTextContent("/ice-cream");
        expect(screen.getByText("linkedin.com/in/max-rosoff")).toBeInTheDocument();
    });
});
