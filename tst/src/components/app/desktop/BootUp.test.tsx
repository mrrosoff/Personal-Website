import { act, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mockSmallScreen, renderWithApp } from "../../../../helpers/render";

import BootUp from "../../../../../src/components/app/desktop/BootUp";

function renderBootUp() {
    const setBootingUp = vi.fn();
    const result = renderWithApp(
        <BootUp setBootingUp={setBootingUp} creationDate={"Mon Jan 01 2026"} />,
        {
            shouldBootUp: true
        }
    );
    return { ...result, setBootingUp };
}

function advanceTo(ms: number) {
    act(() => vi.advanceTimersByTime(ms));
}

function connection(value: object | undefined) {
    Object.defineProperty(navigator, "connection", { value, configurable: true });
}

beforeEach(() => {
    vi.useFakeTimers();
    connection(undefined);
});

afterEach(() => {
    vi.useRealTimers();
});

describe("BootUp", () => {
    it("should show the release details straight away", () => {
        renderBootUp();

        expect(screen.getByText("Released: Mon Jan 01 2026")).toBeInTheDocument();
        expect(screen.getByText("Rosoff OS (BETA PROGRAM)")).toBeInTheDocument();
    });

    it.each([
        [1050, "2.0MB"],
        [1200, "20KB"],
        [1350, "87KB"],
        [1500, "173KB"],
        [1650, "837KM"],
        [1800, "1.1MB"]
    ])("should count up memory at %ims", (ms, memory) => {
        renderBootUp();

        advanceTo(ms);

        expect(screen.getByText(memory)).toBeInTheDocument();
    });

    it("should run through the whole boot and hand over", () => {
        const { setBootingUp } = renderBootUp();

        advanceTo(5250);
        expect(screen.getByText(/Detecting Secondary Drive/)).toHaveTextContent("SUCCESS");
        expect(screen.getByText(/Initializing OS/)).toHaveTextContent("SUCCESS");
        expect(screen.getByText(/Detecting Network Link/)).toHaveTextContent("CONNECTED");
        expect(screen.getByText(/Starting Computer \./)).toBeInTheDocument();
        advanceTo(250);
        expect(screen.getByText(/Starting Computer \.\./)).toBeInTheDocument();
        advanceTo(500);
        expect(screen.getByText(/Starting Computer \.$/)).toBeInTheDocument();

        advanceTo(1150);
        expect(setBootingUp).toHaveBeenCalledWith(false);
        expect(sessionStorage.getItem("HAS_BOOTED_UP")).toBe("true");
    });

    it("should name the network connection type", () => {
        connection({ type: "wifi" });
        renderBootUp();

        advanceTo(3500);

        expect(screen.getByText(/Detecting Network Link/)).toHaveTextContent("(WIFI)");
    });

    it("should fall back to the connection speed", () => {
        connection({ type: "unknown", effectiveType: "4g" });
        renderBootUp();

        advanceTo(3500);

        expect(screen.getByText(/Detecting Network Link/)).toHaveTextContent("(4G)");
    });

    it("should say when it is offline", () => {
        vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
        renderBootUp();

        advanceTo(3850);

        expect(screen.getByText(/Detecting Network Link/)).toHaveTextContent("OFFLINE");
    });

    it("should shorten the boot on a small screen", () => {
        mockSmallScreen();
        renderBootUp();

        advanceTo(4700);

        expect(screen.getByText("(BETA PROGRAM)")).toBeInTheDocument();
        expect(screen.getByText(/Detecting Drive/)).toBeInTheDocument();
        expect(screen.queryByText(/Secondary Drive/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Initializing OS/)).not.toBeInTheDocument();
    });

    it("should reveal each line one step at a time", () => {
        renderBootUp();
        const steps: [number, string, string?][] = [
            [450, "AF6S7V89 - JUC84X", "User:"],
            [200, "User:", "Device Name:"],
            [200, "Device Name:", "Memory Test:"],
            [1100, "Memory Test:", "Detecting Primary Drive"],
            [250, "Detecting Primary Drive"],
            [300, "Detecting Secondary Drive"],
            [1850, "Initializing OS"]
        ];

        for (const [ms, shown, hidden] of steps) {
            advanceTo(ms);
            expect(screen.getByText(new RegExp(shown))).toBeInTheDocument();
            if (hidden) expect(screen.queryByText(new RegExp(hidden))).not.toBeInTheDocument();
        }

        expect(screen.getByText(/Detecting Primary Drive/)).toHaveTextContent("SUCCESS");
        expect(screen.getByText(/Detecting Secondary Drive/)).toHaveTextContent("SUCCESS");
        expect(screen.getByText(/Initializing OS/)).not.toHaveTextContent("SUCCESS");
    });

    it("should wait to mark each drive found", () => {
        renderBootUp();

        advanceTo(2200);
        expect(screen.getByText(/Detecting Primary Drive/)).not.toHaveTextContent("SUCCESS");
        advanceTo(300);
        expect(screen.getByText(/Detecting Secondary Drive/)).not.toHaveTextContent("SUCCESS");
    });
});
