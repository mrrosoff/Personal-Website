import { act, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mockTerminalTheme, renderWithApp } from "../../../../helpers/render";

import PasswordPrompt from "../../../../../site/components/terminal/Terminal/PasswordPrompt";

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

describe("PasswordPrompt", () => {
    it("should count dots while signing in", () => {
        renderWithApp(
            <PasswordPrompt theme={mockTerminalTheme} loading>
                {null}
            </PasswordPrompt>
        );

        act(() => void vi.advanceTimersByTime(600));

        expect(screen.getByText("..")).toBeInTheDocument();
    });

    it("should blink a cursor while waiting", () => {
        renderWithApp(
            <PasswordPrompt theme={mockTerminalTheme} loading={false}>
                {null}
            </PasswordPrompt>
        );
        const cursor = screen.getByTestId("cursor");

        act(() => void vi.advanceTimersByTime(600));

        expect(cursor).toHaveStyle({ visibility: "hidden" });
    });
});
