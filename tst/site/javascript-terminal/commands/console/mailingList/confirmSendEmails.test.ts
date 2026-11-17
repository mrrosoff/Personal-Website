import { describe, expect, it } from "vitest";

import { mockAdminState } from "../../../../../helpers/terminal";
import { axiosPost } from "../../../../../__mocks__/axios";

import { handleAdminConsoleKeyPress } from "../../../../../../site/javascript-terminal/commands/console";
import { AdminConsoleScreen } from "../../../../../../site/javascript-terminal/emulator-state/EmulatorState";

function prompt(selectedOption: "yes" | "no", message?: string) {
    return mockAdminState({
        screen: AdminConsoleScreen.ConfirmSendEmails,
        selectedOption,
        ...(message !== undefined && { marketing: { message } })
    });
}

describe("handleConfirmSendEmails", () => {
    it("should toggle between yes and no", async () => {
        const result = await handleAdminConsoleKeyPress("ArrowRight", prompt("yes"));

        expect(result.getAdminConsoleMode()?.selectedOption).toBe("no");
    });

    it("should toggle back to yes", async () => {
        const result = await handleAdminConsoleKeyPress("ArrowLeft", prompt("no"));

        expect(result.getAdminConsoleMode()?.selectedOption).toBe("yes");
    });

    it("should send the broadcast with the message", async () => {
        const result = await handleAdminConsoleKeyPress("Enter", prompt("yes", "New flavors!"));

        expect(axiosPost).toHaveBeenCalledWith(
            "https://api.maxrosoff.com/email/send-email",
            { message: "New flavors!" },
            expect.any(Object)
        );
        expect(result.getAdminConsoleMode()?.screen).toBe(AdminConsoleScreen.Main);
    });

    it("should send an empty message when none was typed", async () => {
        await handleAdminConsoleKeyPress("Enter", prompt("yes"));

        expect(axiosPost).toHaveBeenCalledWith(
            expect.any(String),
            { message: "" },
            expect.any(Object)
        );
    });

    it("should show an error when sending fails", async () => {
        axiosPost.mockRejectedValue(new Error("offline"));

        const result = await handleAdminConsoleKeyPress("Enter", prompt("yes"));

        expect(result.getAdminConsoleMode()).toMatchObject({
            screen: AdminConsoleScreen.ConfirmSendEmails,
            error: "Failed To Send Marketing Emails"
        });
    });

    it("should go back without sending on no", async () => {
        const result = await handleAdminConsoleKeyPress("Enter", prompt("no"));

        expect(axiosPost).not.toHaveBeenCalled();
        expect(result.getAdminConsoleMode()?.screen).toBe(AdminConsoleScreen.Main);
    });

    it("should go back on escape", async () => {
        const result = await handleAdminConsoleKeyPress("Escape", prompt("yes"));

        expect(result.getAdminConsoleMode()?.selectedOption).toBe("SendMarketingEmails");
    });

    it("should type the message", async () => {
        const result = await handleAdminConsoleKeyPress("!", prompt("yes", "Hi"));

        expect(result.getAdminConsoleMode()?.marketing).toEqual({ message: "Hi!" });
    });
});
