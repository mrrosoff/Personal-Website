import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { mockTerminalTheme, renderWithApp } from "../../../helpers/render";
import { mockEmulatorState } from "../../../helpers/terminal";

import PromptSymbol from "../../../../src/components/terminal/PromptSymbol";

describe("PromptSymbol", () => {
    it("should show the given directory", () => {
        renderWithApp(
            <PromptSymbol theme={mockTerminalTheme} cwd={"/media"}>
                {"$"}
            </PromptSymbol>
        );

        expect(screen.getByText("/media")).toBeInTheDocument();
    });

    it("should fall back to the working directory", () => {
        renderWithApp(<PromptSymbol theme={mockTerminalTheme}>{"$"}</PromptSymbol>, {
            emulatorState: mockEmulatorState({ cwd: "/home" })
        });

        expect(screen.getByText("/home")).toBeInTheDocument();
    });
});
