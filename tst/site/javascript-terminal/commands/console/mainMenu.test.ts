import { describe, expect, it } from "vitest";

import { mockAdminState } from "../../../../helpers/terminal";

import { handleMainMenu } from "../../../../../site/javascript-terminal/commands/console/mainMenu";
import {
    AdminConsoleScreen,
    MainMenuOption
} from "../../../../../site/javascript-terminal/emulatorState/EmulatorState";

function menuAt(selectedOption: MainMenuOption) {
    return mockAdminState({ screen: AdminConsoleScreen.Main, selectedOption });
}

describe("handleMainMenu", () => {
    it("should move down the menu", () => {
        const result = handleMainMenu("ArrowDown", menuAt(MainMenuOption.IceCreamInventory));

        expect(result.getAdminConsoleMode()?.selectedOption).toBe(
            MainMenuOption.SendMarketingEmails
        );
    });

    it("should stop at the top of the menu", () => {
        const result = handleMainMenu("ArrowUp", menuAt(MainMenuOption.IceCreamInventory));

        expect(result.getAdminConsoleMode()?.selectedOption).toBe(MainMenuOption.IceCreamInventory);
    });

    it("should open the ice cream inventory", () => {
        const result = handleMainMenu("Enter", menuAt(MainMenuOption.IceCreamInventory));

        expect(result.getAdminConsoleMode()).toMatchObject({
            screen: AdminConsoleScreen.IceCreamInventory,
            selectedOption: "ProvisionNewFlavor"
        });
    });

    it("should open the marketing email prompt", () => {
        const result = handleMainMenu("Enter", menuAt(MainMenuOption.SendMarketingEmails));

        expect(result.getAdminConsoleMode()).toMatchObject({
            screen: AdminConsoleScreen.ConfirmSendEmails,
            selectedOption: "yes",
            marketing: { message: "" }
        });
    });

    it("should open a blank friend invite", () => {
        const result = handleMainMenu("Enter", menuAt(MainMenuOption.CreateFriendInvite));

        expect(result.getAdminConsoleMode()).toMatchObject({
            screen: AdminConsoleScreen.CreateFriendInvite,
            friendInvite: { friendName: "", durationHours: 6, currentField: "friendName" }
        });
    });

    it("should open a blank mailing list entry", () => {
        const result = handleMainMenu("Enter", menuAt(MainMenuOption.AddMailingListEntry));

        expect(result.getAdminConsoleMode()).toMatchObject({
            screen: AdminConsoleScreen.AddMailingListEntry,
            mailingListEntry: { email: "", currentField: "firstName" }
        });
    });

    it("should close the console on exit", () => {
        const result = handleMainMenu("Enter", menuAt(MainMenuOption.Exit));

        expect(result.getAdminConsoleMode()).toBeUndefined();
    });

    it("should close the console on escape", () => {
        const result = handleMainMenu("Escape", menuAt(MainMenuOption.IceCreamInventory));

        expect(result.getAdminConsoleMode()).toBeUndefined();
    });

    it("should ignore other keys", () => {
        const result = handleMainMenu("a", menuAt(MainMenuOption.IceCreamInventory));

        expect(result.getAdminConsoleMode()?.selectedOption).toBe(MainMenuOption.IceCreamInventory);
    });
});
