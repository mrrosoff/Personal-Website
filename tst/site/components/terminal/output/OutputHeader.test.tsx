import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { mockTerminalTheme, renderWithApp } from "../../../../helpers/render";

import OutputHeader from "../../../../../site/components/terminal/output/OutputHeader";

describe("OutputHeader", () => {
    it("should show the prompt, directory and command", () => {
        renderWithApp(
            <OutputHeader theme={mockTerminalTheme} promptSymbol={"$"} cwd={"/home"}>
                {"ls"}
            </OutputHeader>
        );

        expect(screen.getByText("$")).toBeInTheDocument();
        expect(screen.getByText("/home")).toBeInTheDocument();
        expect(screen.getByText("ls")).toBeInTheDocument();
    });
});
