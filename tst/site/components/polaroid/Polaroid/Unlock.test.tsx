import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithApp } from "../../../../helpers/render";

import Unlock from "../../../../../site/components/polaroid/Polaroid/Unlock";

function renderUnlock(onUnlock = vi.fn(() => Promise.resolve())) {
    return { ...renderWithApp(<Unlock onUnlock={onUnlock} />, { route: "/polaroid" }), onUnlock };
}

describe("Unlock", () => {
    it("should unlock with a tap", async () => {
        const { user, onUnlock } = renderUnlock();

        await user.click(screen.getByText("Unlock"));

        expect(onUnlock).toHaveBeenCalledOnce();
    });

    it("should unlock with a key press", () => {
        const { onUnlock } = renderUnlock();

        fireEvent.keyDown(window, { key: "Enter" });

        expect(onUnlock).toHaveBeenCalledOnce();
    });

    it("should ignore shortcuts and named keys", () => {
        const { onUnlock } = renderUnlock();

        fireEvent.keyDown(window, { key: "c", metaKey: true });
        fireEvent.keyDown(window, { key: "c", ctrlKey: true });
        fireEvent.keyDown(window, { key: "c", altKey: true });
        fireEvent.keyDown(window, { key: "Shift" });

        expect(onUnlock).not.toHaveBeenCalled();
    });

    it("should ignore taps and keys while unlocking", async () => {
        const { user, onUnlock } = renderUnlock(vi.fn(() => new Promise<void>(() => undefined)));

        await user.click(screen.getByText("Unlock"));
        await user.click(screen.getByText("Authenticating"));
        fireEvent.keyDown(window, { key: "a" });

        expect(onUnlock).toHaveBeenCalledOnce();
    });

    it("should send someone home when unlocking fails", async () => {
        const { user } = renderUnlock(vi.fn(() => Promise.reject(new Error("cancelled"))));

        await user.click(screen.getByText("Unlock"));

        await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent(/^\/$/));
    });
});
