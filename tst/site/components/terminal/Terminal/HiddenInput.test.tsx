import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithApp } from "../../../../helpers/render";

import HiddenInput from "../../../../../site/components/terminal/Terminal/HiddenInput";

describe("HiddenInput", () => {
    it("should pass key presses on", () => {
        const onKeyDown = vi.fn();
        renderWithApp(<HiddenInput onKeyDown={onKeyDown} readOnly />);

        fireEvent.keyDown(screen.getByRole("textbox"), { key: "a" });

        expect(onKeyDown).toHaveBeenCalled();
        expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
    });
});
