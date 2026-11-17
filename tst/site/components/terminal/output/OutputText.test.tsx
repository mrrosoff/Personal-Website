import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { mockSmallScreen, mockTerminalTheme, renderWithApp } from "../../../../helpers/render";

import OutputText from "../../../../../site/components/terminal/output/OutputText";

describe("OutputText", () => {
    it("should keep spacing on a wide screen", () => {
        renderWithApp(<OutputText theme={mockTerminalTheme}>{"a  b\nc"}</OutputText>);

        expect(screen.getByText("a b", { normalizer: (t) => t.replace(/\s+/g, " ") })).toHaveStyle({
            whiteSpace: "pre"
        });
    });

    it("should wrap lines on a small screen", () => {
        mockSmallScreen();

        renderWithApp(<OutputText theme={mockTerminalTheme}>{"wrapped"}</OutputText>);

        expect(screen.getByText("wrapped")).toHaveStyle({ whiteSpace: "pre-wrap" });
    });

    it("should render nothing for missing output", () => {
        renderWithApp(<OutputText theme={mockTerminalTheme}>{undefined as never}</OutputText>);

        expect(document.querySelectorAll("p")).toHaveLength(1);
    });
});
