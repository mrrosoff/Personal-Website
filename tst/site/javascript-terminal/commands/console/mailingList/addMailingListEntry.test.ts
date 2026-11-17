import { describe, expect, it } from "vitest";

import { mockAdminState } from "../../../../../helpers/terminal";
import { axiosPost } from "../../../../../mocks/axios";

import { handleAddMailingListEntry } from "../../../../../../site/javascript-terminal/commands/console/mailingList/addMailingListEntry";
import { AdminConsoleScreen } from "../../../../../../site/javascript-terminal/emulator-state/EmulatorState";
import type { MailingListEntry } from "../../../../../../site/javascript-terminal/emulator-state/EmulatorState";

const blankEntry: MailingListEntry = {
    firstName: "Ada",
    lastName: "",
    email: "ada@example.com",
    currentField: "firstName"
};

function entry(changes: Partial<MailingListEntry> = {}) {
    return mockAdminState({
        screen: AdminConsoleScreen.AddMailingListEntry,
        mailingListEntry: { ...blankEntry, ...changes }
    });
}

async function press(key: string, state = entry()) {
    return (await handleAddMailingListEntry(key, state)).getAdminConsoleModeOn(
        AdminConsoleScreen.AddMailingListEntry
    );
}

describe("handleAddMailingListEntry", () => {
    it("should go back to the main menu on escape", async () => {
        const result = (await handleAddMailingListEntry("Escape", entry())).getAdminConsoleMode();

        expect(result).toMatchObject({
            screen: AdminConsoleScreen.Main,
            selectedOption: "AddMailingListEntry",
            mailingListEntry: undefined
        });
    });

    it("should go back to the main menu after adding", async () => {
        const result = await handleAddMailingListEntry("Enter", entry({ added: true }));

        expect(result.getAdminConsoleMode()?.screen).toBe(AdminConsoleScreen.Main);
    });

    it("should ignore typing after adding", async () => {
        const result = await press("a", entry({ added: true }));

        expect(result.mailingListEntry.firstName).toBe("Ada");
    });

    it("should move between fields", async () => {
        const result = await press("ArrowUp");

        expect(result.mailingListEntry.currentField).toBe("email");
    });

    it("should type into the current field", async () => {
        const result = await press("h");

        expect(result.mailingListEntry.firstName).toBe("Adah");
    });

    it("should refuse an invalid email", async () => {
        const result = await press("Enter", entry({ email: "nope" }));

        expect(result.error).toBe("Enter A Valid Email Address");
    });

    it("should add the person to the mailing list", async () => {
        const result = await press("Enter");

        expect(axiosPost).toHaveBeenCalledWith("https://api.maxrosoff.com/email/register", {
            firstName: "Ada",
            lastName: undefined,
            email: "ada@example.com"
        });
        expect(result).toMatchObject({ loading: false, mailingListEntry: { added: true } });
    });

    it("should show an error when adding fails", async () => {
        axiosPost.mockRejectedValue(new Error("offline"));

        const result = await press("Enter");

        expect(result.error).toBe("Failed To Add To Mailing List");
    });

    it("should move down through the fields", async () => {
        const result = await press("ArrowDown");

        expect(result.mailingListEntry.currentField).toBe("lastName");
    });
});
