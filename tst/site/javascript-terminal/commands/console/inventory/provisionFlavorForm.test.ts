import { describe, expect, it } from "vitest";

import { mockAdminState } from "../../../../../helpers/terminal";

import { handleProvisionFlavorForm } from "../../../../../../site/javascript-terminal/commands/console/inventory/provisionFlavorForm";
import { AdminConsoleScreen } from "../../../../../../site/javascript-terminal/emulator-state/EmulatorState";
import type { ProvisionFlavorForm } from "../../../../../../site/javascript-terminal/emulator-state/EmulatorState";

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
    it("should move to the next field on tab", () => {
        const result = handleProvisionFlavorForm("Tab", form("flavorName"));

        expect(result.getAdminConsoleMode()?.provisionForm?.currentField).toBe("initialQuantity");
    });

    it("should wrap from the first field to the last", () => {
        const result = handleProvisionFlavorForm("ArrowUp", form("flavorName"));

        expect(result.getAdminConsoleMode()?.provisionForm?.currentField).toBe("type");
    });

    it("should cycle the type", () => {
        const result = handleProvisionFlavorForm("ArrowLeft", form("type"));

        expect(result.getAdminConsoleMode()?.provisionForm?.type).toBe("upcoming");
    });

    it("should not cycle anything on another field", () => {
        const result = handleProvisionFlavorForm("ArrowRight", form("color"));

        expect(result.getAdminConsoleMode()?.provisionForm).toEqual({
            ...blankForm,
            currentField: "color"
        });
    });

    it("should type into the name", () => {
        const result = handleProvisionFlavorForm("s", form("flavorName"));

        expect(result.getAdminConsoleMode()?.provisionForm?.flavorName).toBe("Figs");
    });

    it("should type into the color", () => {
        const result = handleProvisionFlavorForm("Backspace", form("color"));

        expect(result.getAdminConsoleMode()?.provisionForm?.color).toBe("whit");
    });

    it("should type a quantity", () => {
        const result = handleProvisionFlavorForm("4", form("initialQuantity"));

        expect(result.getAdminConsoleMode()?.provisionForm?.initialQuantity).toBe(24);
    });

    it("should not type into the type", () => {
        const result = handleProvisionFlavorForm("a", form("type"));

        expect(result.getAdminConsoleMode()?.provisionForm?.type).toBeNull();
    });

    it("should ask for confirmation", () => {
        const result = handleProvisionFlavorForm("Enter", form("flavorName"));

        expect(result.getAdminConsoleMode()).toMatchObject({
            screen: AdminConsoleScreen.ConfirmProvisionFlavor,
            selectedOption: "yes"
        });
    });

    it("should discard the form on escape", () => {
        const result = handleProvisionFlavorForm("Escape", form("flavorName"));

        expect(result.getAdminConsoleMode()).toMatchObject({
            screen: AdminConsoleScreen.IceCreamInventory,
            provisionForm: undefined
        });
    });

    it("should move down through the fields", () => {
        const result = handleProvisionFlavorForm("ArrowDown", form("color"));

        expect(result.getAdminConsoleMode()?.provisionForm?.currentField).toBe("type");
    });
});
