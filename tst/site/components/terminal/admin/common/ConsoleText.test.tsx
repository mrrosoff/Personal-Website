import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { mockTerminalTheme, renderWithApp } from "../../../../../helpers/render";

import {
    ConsoleHeading,
    ConsoleHint
} from "../../../../../../site/components/terminal/admin/common/ConsoleText";

describe("ConsoleHeading", () => {
    it("should name the console", () => {
        renderWithApp(<ConsoleHeading theme={mockTerminalTheme} />);

        expect(screen.getByText("=== Admin Console ===")).toBeInTheDocument();
    });

    it("should name the current screen", () => {
        renderWithApp(<ConsoleHeading theme={mockTerminalTheme} title={"Select Flavor"} />);

        expect(screen.getByText("=== Admin Console (Select Flavor) ===")).toBeInTheDocument();
    });
});

describe("ConsoleHint", () => {
    it("should show a dimmed hint", () => {
        renderWithApp(<ConsoleHint theme={mockTerminalTheme}>{"escape: back"}</ConsoleHint>);

        expect(screen.getByText("escape: back")).toHaveStyle({ opacity: "0.7" });
    });
});
