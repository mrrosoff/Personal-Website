import { describe, expect, it } from "vitest";

import { mockAdminState } from "../../../../helpers/terminal";

import { handleAdminConsoleKeyPress } from "../../../../../src/javascript-terminal/commands/console";
import {
    AdminConsoleScreen,
    MainMenuOption
} from "../../../../../src/javascript-terminal/emulator-state/EmulatorState";

function menuAt(selectedOption: MainMenuOption) {
    return mockAdminState({ screen: AdminConsoleScreen.Main, selectedOption });
}

describe("handleMainMenu", () => {
    it("should move down the menu", async () => {
        const result = await handleAdminConsoleKeyPress(
            "ArrowDown",
            menuAt(MainMenuOption.IceCreamInventory)
        );

        expect(result.getAdminConsoleMode()?.selectedOption).toBe(
            MainMenuOption.SendMarketingEmails
        );
    });

    it("should stop at the top of the menu", async () => {
        const result = await handleAdminConsoleKeyPress(
            "ArrowUp",
            menuAt(MainMenuOption.IceCreamInventory)
        );

        expect(result.getAdminConsoleMode()?.selectedOption).toBe(MainMenuOption.IceCreamInventory);
    });

    it("should open the ice cream inventory", async () => {
        const result = await handleAdminConsoleKeyPress(
            "Enter",
            menuAt(MainMenuOption.IceCreamInventory)
        );

        expect(result.getAdminConsoleMode()).toMatchObject({
            screen: AdminConsoleScreen.IceCreamInventory,
            selectedOption: "ProvisionNewFlavor"
        });
    });

    it("should open the marketing email prompt", async () => {
        const result = await handleAdminConsoleKeyPress(
            "Enter",
            menuAt(MainMenuOption.SendMarketingEmails)
        );

        expect(result.getAdminConsoleMode()).toMatchObject({
            screen: AdminConsoleScreen.ConfirmSendEmails,
            selectedOption: "yes",
            marketing: { message: "" }
        });
    });

    it("should open a blank friend invite", async () => {
        const result = await handleAdminConsoleKeyPress(
            "Enter",
            menuAt(MainMenuOption.CreateFriendInvite)
        );

        expect(result.getAdminConsoleMode()).toMatchObject({
            screen: AdminConsoleScreen.CreateFriendInvite,
            friendInvite: { friendName: "", durationHours: 6, currentField: "friendName" }
        });
    });

    it("should open a blank mailing list entry", async () => {
        const result = await handleAdminConsoleKeyPress(
            "Enter",
            menuAt(MainMenuOption.AddMailingListEntry)
        );

        expect(result.getAdminConsoleMode()).toMatchObject({
            screen: AdminConsoleScreen.AddMailingListEntry,
            mailingListEntry: { email: "", currentField: "firstName" }
        });
    });

    it("should close the console on exit", async () => {
        const result = await handleAdminConsoleKeyPress("Enter", menuAt(MainMenuOption.Exit));

        expect(result.getAdminConsoleMode()).toBeUndefined();
    });

    it("should close the console on escape", async () => {
        const result = await handleAdminConsoleKeyPress(
            "Escape",
            menuAt(MainMenuOption.IceCreamInventory)
        );

        expect(result.getAdminConsoleMode()).toBeUndefined();
    });

    it("should ignore other keys", async () => {
        const result = await handleAdminConsoleKeyPress(
            "a",
            menuAt(MainMenuOption.IceCreamInventory)
        );

        expect(result.getAdminConsoleMode()?.selectedOption).toBe(MainMenuOption.IceCreamInventory);
    });
});
