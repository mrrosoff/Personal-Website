import { act, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithApp } from "../../../helpers/render";

import CrashScreen from "../../../../site/components/error-boundary/CrashScreen";

function advance(ms: number) {
    act(() => void vi.advanceTimersByTime(ms));
}

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

describe("CrashScreen", () => {
    it("should report the crash and forget the boot", () => {
        sessionStorage.setItem("HAS_BOOTED_UP", "true");

        renderWithApp(<CrashScreen />);

        expect(screen.getByText("Segmentation fault (core dumped)")).toBeInTheDocument();
        expect(sessionStorage.getItem("HAS_BOOTED_UP")).toBeNull();
    });

    it("should blink the cursor", () => {
        renderWithApp(<CrashScreen />);
        const cursor = screen.getByTestId("cursor");

        advance(600);

        expect(cursor).toHaveStyle({ visibility: "hidden" });
    });

    it("should restart, boot and reload the site", () => {
        const location = { href: "/broken" };
        vi.stubGlobal("location", location);
        vi.spyOn(Math, "random").mockReturnValue(0);
        renderWithApp(<CrashScreen />);

        act(() => screen.getByText("restart").click());
        advance(500);
        expect(screen.getByText("restart.")).toBeInTheDocument();

        advance(2500);
        advance(40 * 21);
        expect(screen.getAllByText("[ OK ] Started Load Kernel Modules.")).toHaveLength(20);

        advance(160);
        advance(1000);
        expect(location.href).toBe("/");
    });

    it("should ignore taps while restarting", () => {
        renderWithApp(<CrashScreen />);
        act(() => screen.getByText("restart").click());

        act(() => screen.getByText("restart").click());

        expect(screen.getByText("restart").tagName).toBe("SPAN");
    });
});
