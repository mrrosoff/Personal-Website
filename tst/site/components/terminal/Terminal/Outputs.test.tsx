import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { mockTerminalTheme, renderWithApp } from "../../../../helpers/render";
import { mockEmulatorState } from "../../../../helpers/terminal";

import Outputs from "../../../../../site/components/terminal/Terminal/Outputs";

function renderOutputs(output: { output?: string | React.JSX.Element; type?: string }[]) {
    const emulatorState = mockEmulatorState();
    emulatorState.setOutputs([{ command: "run", output }]);
    renderWithApp(<Outputs theme={mockTerminalTheme} promptSymbol={"dev@rosoff"} />, {
        emulatorState
    });
}

describe("Outputs", () => {
    it("should show the command with its output", () => {
        renderOutputs([{ output: "hello" }]);

        expect(screen.getByText("run")).toBeInTheDocument();
        expect(screen.getByText("hello")).toBeInTheDocument();
    });

    it("should show errors in the error color", () => {
        renderOutputs([{ output: "nope", type: "error" }]);

        expect(screen.getByText("nope")).toHaveStyle({ color: mockTerminalTheme.errorColor });
    });

    it("should render a command's own elements and skip navigation", () => {
        renderOutputs([
            { output: <p>{"element"}</p>, type: "react" },
            { output: "/ice-cream", type: "navigate" }
        ]);

        expect(screen.getByText("element")).toBeInTheDocument();
        expect(screen.queryByText("/ice-cream")).not.toBeInTheDocument();
    });
});
