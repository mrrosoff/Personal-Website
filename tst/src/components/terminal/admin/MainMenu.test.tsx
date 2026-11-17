import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { mockSmallScreen, mockTerminalTheme, renderWithApp } from "../../../../helpers/render";
import { mockAdminState } from "../../../../helpers/terminal";

import MainMenu from "../../../../../src/components/terminal/admin/MainMenu";
import {
    type AdminConsoleMode,
    AdminConsoleScreen,
    MainMenuOption
} from "../../../../../src/javascript-terminal/emulator-state/EmulatorState";

function renderMenu() {
    const onAction = vi.fn();
    const consoleMode: AdminConsoleMode<AdminConsoleScreen.Main> = {
        screen: AdminConsoleScreen.Main,
        selectedOption: MainMenuOption.IceCreamInventory
    };
    const emulatorState = mockAdminState(consoleMode);
    const result = renderWithApp(
        <MainMenu theme={mockTerminalTheme} onAction={onAction} mode={consoleMode} />,
        {
            emulatorState
        }
    );
    return { ...result, onAction, emulatorState };
}

describe("MainMenu", () => {
    it("should highlight the selected option", () => {
        renderMenu();

        expect(screen.getByText(/Ice Cream Inventory/)).toHaveTextContent(
            "> 1. Ice Cream Inventory"
        );
    });

    it("should explain the keyboard controls", () => {
        renderMenu();

        expect(screen.getByText(/use arrow keys/)).toBeInTheDocument();
    });

    it.each([
        ["1. Ice Cream Inventory", MainMenuOption.IceCreamInventory],
        ["2. Send Marketing Emails", MainMenuOption.SendMarketingEmails],
        ["3. Add To Mailing List", MainMenuOption.AddMailingListEntry],
        ["4. Create Friend Invite", MainMenuOption.CreateFriendInvite],
        ["5. Exit", MainMenuOption.Exit]
    ])("should choose %s with a tap on a small screen", async (label, option) => {
        mockSmallScreen();
        const { user, onAction, emulatorState } = renderMenu();

        await user.click(screen.getByText(label, { exact: false }));

        expect(emulatorState.getAdminConsoleMode()?.selectedOption).toBe(option);
        expect(onAction).toHaveBeenCalledWith("Enter");
        expect(screen.getByText("tap an option to select")).toBeInTheDocument();
    });
});
