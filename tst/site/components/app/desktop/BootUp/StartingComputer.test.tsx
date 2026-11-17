import { act, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithApp } from "../../../../../helpers/render";

import StartingComputer from "../../../../../../site/components/app/desktop/BootUp/StartingComputer";

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

describe("StartingComputer", () => {
    it("should cycle its dots", () => {
        renderWithApp(<StartingComputer />);

        expect(screen.getByText("Starting Computer .")).toBeInTheDocument();
        act(() => void vi.advanceTimersByTime(500));
        expect(screen.getByText("Starting Computer ...")).toBeInTheDocument();
        act(() => void vi.advanceTimersByTime(250));
        expect(screen.getByText("Starting Computer .")).toBeInTheDocument();
    });
});
