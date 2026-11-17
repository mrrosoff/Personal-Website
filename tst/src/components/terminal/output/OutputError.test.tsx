import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { mockTerminalTheme, renderWithApp } from "../../../../helpers/render";

import OutputError from "../../../../../src/components/terminal/output/OutputError";

describe("OutputError", () => {
    it("should show each line in the error color", () => {
        renderWithApp(<OutputError theme={mockTerminalTheme}>{"first\nsecond"}</OutputError>);

        expect(screen.getByText("second")).toHaveStyle({ color: mockTerminalTheme.errorColor });
        expect(screen.getByText("first")).toBeInTheDocument();
    });
});
