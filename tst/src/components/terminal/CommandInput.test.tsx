import { act, fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { mockTerminalTheme, renderWithApp } from "../../../helpers/render";

import CommandInput from "../../../../src/components/terminal/CommandInput";

function renderInput(value = "ls") {
    const onChange = vi.fn();
    const onKeyDown = vi.fn();
    const result = renderWithApp(
        <CommandInput
            theme={mockTerminalTheme}
            promptSymbol={"dev@rosoff"}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
        />
    );
    return { ...result, onChange, onKeyDown };
}

describe("CommandInput", () => {
    it("should show the prompt and what has been typed", () => {
        renderInput();

        expect(screen.getByText("dev@rosoff")).toBeInTheDocument();
        expect(screen.getByText("ls")).toBeInTheDocument();
    });

    it("should pass typing and keys through", () => {
        const { onChange, onKeyDown } = renderInput("");

        fireEvent.change(screen.getByRole("textbox"), { target: { value: "p" } });
        fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });

        expect(onChange).toHaveBeenCalled();
        expect(onKeyDown).toHaveBeenCalled();
    });

    it("should blink the cursor", () => {
        vi.useFakeTimers();
        renderInput();
        const cursor = document.getElementById("cursor")!;

        act(() => vi.advanceTimersByTime(600));

        expect(cursor).toHaveStyle({ visibility: "hidden" });
        vi.useRealTimers();
    });
});
