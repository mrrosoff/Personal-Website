import { describe, expect, it } from "vitest";

import { mockAdminState } from "../../../../../helpers/terminal";

import { handleAdminConsoleKeyPress } from "../../../../../../site/javascript-terminal/commands/console";
import {
    AdminConsoleScreen,
    type ProvisionFlavorForm
} from "../../../../../../site/javascript-terminal/emulator-state/EmulatorState";

const blankForm: ProvisionFlavorForm = {
    flavorName: "Fig",
    initialQuantity: 2,
    color: "white",
    type: null,
    currentField: "flavorName"
};

function form(currentField: ProvisionFlavorForm["currentField"]) {
    return mockAdminState({
        screen: AdminConsoleScreen.ProvisionFlavorForm,
        provisionForm: { ...blankForm, currentField }
    });
}

describe("handleProvisionFlavorForm", () => {
    it("should move to the next field on tab", async () => {
        const result = await handleAdminConsoleKeyPress("Tab", form("flavorName"));

        expect(result.getAdminConsoleMode()?.provisionForm?.currentField).toBe("initialQuantity");
    });

    it("should wrap from the first field to the last", async () => {
        const result = await handleAdminConsoleKeyPress("ArrowUp", form("flavorName"));

        expect(result.getAdminConsoleMode()?.provisionForm?.currentField).toBe("type");
    });

    it("should cycle the type", async () => {
        const result = await handleAdminConsoleKeyPress("ArrowLeft", form("type"));

        expect(result.getAdminConsoleMode()?.provisionForm?.type).toBe("upcoming");
    });

    it("should not cycle anything on another field", async () => {
        const result = await handleAdminConsoleKeyPress("ArrowRight", form("color"));

        expect(result.getAdminConsoleMode()?.provisionForm).toEqual({
            ...blankForm,
            currentField: "color"
        });
    });

    it("should type into the name", async () => {
        const result = await handleAdminConsoleKeyPress("s", form("flavorName"));

        expect(result.getAdminConsoleMode()?.provisionForm?.flavorName).toBe("Figs");
    });

    it("should type into the color", async () => {
        const result = await handleAdminConsoleKeyPress("Backspace", form("color"));

        expect(result.getAdminConsoleMode()?.provisionForm?.color).toBe("whit");
    });

    it("should type a quantity", async () => {
        const result = await handleAdminConsoleKeyPress("4", form("initialQuantity"));

        expect(result.getAdminConsoleMode()?.provisionForm?.initialQuantity).toBe(24);
    });

    it("should not type into the type", async () => {
        const result = await handleAdminConsoleKeyPress("a", form("type"));

        expect(result.getAdminConsoleMode()?.provisionForm?.type).toBeNull();
    });

    it("should ask for confirmation", async () => {
        const result = await handleAdminConsoleKeyPress("Enter", form("flavorName"));

        expect(result.getAdminConsoleMode()).toMatchObject({
            screen: AdminConsoleScreen.ConfirmProvisionFlavor,
            selectedOption: "yes"
        });
    });

    it("should discard the form on escape", async () => {
        const result = await handleAdminConsoleKeyPress("Escape", form("flavorName"));

        expect(result.getAdminConsoleMode()).toMatchObject({
            screen: AdminConsoleScreen.IceCreamInventory,
            provisionForm: undefined
        });
    });

    it("should move down through the fields", async () => {
        const result = await handleAdminConsoleKeyPress("ArrowDown", form("color"));

        expect(result.getAdminConsoleMode()?.provisionForm?.currentField).toBe("type");
    });
});
