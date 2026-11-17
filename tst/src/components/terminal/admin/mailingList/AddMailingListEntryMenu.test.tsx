import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { mockSmallScreen, mockTerminalTheme, renderWithApp } from "../../../../../helpers/render";
import { mockAdminState } from "../../../../../helpers/terminal";

import AddMailingListEntryMenu from "../../../../../../src/components/terminal/admin/mailingList/AddMailingListEntryMenu";
import {
    AdminConsoleScreen,
    type AdminConsoleState,
    type MailingListEntry
} from "../../../../../../src/javascript-terminal/emulator-state/EmulatorState";

const blankEntry: MailingListEntry = {
    firstName: "Ada",
    lastName: "",
    email: "",
    currentField: "firstName"
};

function renderMenu(entry: Partial<MailingListEntry> = {}, mode: Partial<AdminConsoleState> = {}) {
    const onAction = vi.fn();
    const emulatorState = mockAdminState({
        screen: AdminConsoleScreen.AddMailingListEntry,
        mailingListEntry: { ...blankEntry, ...entry },
        ...mode
    });
    const result = renderWithApp(
        <AddMailingListEntryMenu theme={mockTerminalTheme} onAction={onAction} />,
        { emulatorState }
    );
    return { ...result, onAction, emulatorState };
}

describe("AddMailingListEntryMenu", () => {
    it("should show a cursor in the current field", () => {
        renderMenu();

        expect(screen.getByText(/First Name/)).toHaveTextContent("> First Name: Ada_");
        expect(screen.getByText(/enter: add/)).toBeInTheDocument();
    });

    it("should hide the cursor while adding", () => {
        renderMenu({}, { loading: true });

        expect(screen.getByText(/First Name/)).toHaveTextContent("> First Name: Ada");
        expect(screen.getByText(/^Adding/)).toBeInTheDocument();
    });

    it("should confirm once added", () => {
        renderMenu({ added: true, email: " ada@example.com " });

        expect(screen.getByText("ada@example.com is on the mailing list.")).toBeInTheDocument();
        expect(screen.getByText("enter: back | escape: back")).toBeInTheDocument();
    });

    it("should pick a field with a tap on a small screen", async () => {
        mockSmallScreen();
        const { user, onAction, emulatorState } = renderMenu();

        await user.click(screen.getByText(/Email:/));

        expect(emulatorState.getAdminConsoleMode()?.mailingListEntry?.currentField).toBe("email");
        expect(onAction).toHaveBeenCalledWith("");
        expect(screen.getByText("tap a field to edit, then Add")).toBeInTheDocument();
    });

    it("should not add without an email", async () => {
        mockSmallScreen();
        const { user, onAction } = renderMenu();

        await user.click(screen.getByText(/^(> )?Add$/));

        expect(onAction).not.toHaveBeenCalled();
    });

    it("should add with a tap once there is an email", async () => {
        mockSmallScreen();
        const { user, onAction } = renderMenu({ email: "ada@example.com" });

        await user.click(screen.getByText(/^(> )?Add$/));

        expect(onAction).toHaveBeenCalledWith("Enter");
    });

    it("should cancel with a tap", async () => {
        mockSmallScreen();
        const { user, onAction } = renderMenu();

        await user.click(screen.getByText(/Cancel/));

        expect(onAction).toHaveBeenCalledWith("Escape");
    });

    it("should go back with a tap once added", async () => {
        mockSmallScreen();
        const { user, onAction } = renderMenu({ added: true, email: "ada@example.com" });

        await user.click(screen.getByText(/^(> )?Back$/));

        expect(onAction).toHaveBeenCalledWith("Escape");
        expect(screen.getByText("tap Back to return")).toBeInTheDocument();
    });
});
