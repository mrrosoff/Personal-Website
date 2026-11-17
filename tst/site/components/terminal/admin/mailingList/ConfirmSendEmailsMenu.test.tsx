import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { mockScreenWidth, mockTerminalTheme, renderWithApp } from "../../../../../helpers/render";
import { mockAdminState } from "../../../../../helpers/terminal";

import ConfirmSendEmailsMenu from "../../../../../../site/components/terminal/admin/mailingList/ConfirmSendEmailsMenu";
import { AdminConsoleScreen } from "../../../../../../site/javascript-terminal/emulatorState/EmulatorState";
import type { AdminConsoleMode } from "../../../../../../site/javascript-terminal/emulatorState/EmulatorState";

function renderMenu(mode: object = {}) {
    const onAction = vi.fn();
    const consoleMode: AdminConsoleMode<AdminConsoleScreen.ConfirmSendEmails> = {
        screen: AdminConsoleScreen.ConfirmSendEmails,
        selectedOption: "yes",
        marketing: { message: "New flavors!" },
        ...mode
    };
    const emulatorState = mockAdminState(consoleMode);
    const result = renderWithApp(
        <ConfirmSendEmailsMenu theme={mockTerminalTheme} onAction={onAction} mode={consoleMode} />,
        { emulatorState }
    );
    return { ...result, onAction, emulatorState };
}

describe("ConfirmSendEmailsMenu", () => {
    it("should show the message being sent", () => {
        renderMenu();

        expect(screen.getByText(/Message: New flavors!/)).toBeInTheDocument();
    });

    it("should explain the keyboard controls", () => {
        renderMenu();

        expect(screen.getByText(/left\/right: select option/)).toBeInTheDocument();
    });

    it("should say when it is sending", () => {
        renderMenu({ loading: true });

        expect(screen.getByText("Sending...")).toBeInTheDocument();
    });

    it.each(["yes", "no"])("should choose %s with a tap on a small screen", async (option) => {
        mockScreenWidth(390);
        const { user, onAction, emulatorState } = renderMenu({ selectedOption: "no" });

        await user.click(screen.getByText(option === "yes" ? /^(> )?Yes$/ : /^(> )?No$/));

        expect(emulatorState.getAdminConsoleMode()?.selectedOption).toBe(option);
        expect(onAction).toHaveBeenCalledWith("Enter");
        expect(screen.getByText("tap Yes or No")).toBeInTheDocument();
    });
});
