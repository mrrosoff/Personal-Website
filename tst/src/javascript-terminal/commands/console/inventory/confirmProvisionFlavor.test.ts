import { describe, expect, it } from "vitest";

import { mockAdminState } from "../../../../../helpers/terminal";
import { axiosPost } from "../../../../../__mocks__/axios";

import { handleConfirmProvisionFlavor } from "../../../../../../src/javascript-terminal/commands/console/inventory/confirmProvisionFlavor";
import { AdminConsoleScreen } from "../../../../../../src/javascript-terminal/emulator-state/EmulatorState";

const provisionForm = {
    flavorName: "Fig",
    initialQuantity: 4,
    color: "purple",
    type: "upcoming" as const,
    currentField: "flavorName" as const
};

function prompt(selectedOption: "yes" | "no") {
    return mockAdminState({
        screen: AdminConsoleScreen.ConfirmProvisionFlavor,
        selectedOption,
        provisionForm
    });
}

describe("handleConfirmProvisionFlavor", () => {
    it("should toggle between yes and no", async () => {
        const result = await handleConfirmProvisionFlavor("ArrowLeft", prompt("yes"));

        expect(result.getAdminConsoleMode()?.selectedOption).toBe("no");
    });

    it("should toggle back to yes", async () => {
        const result = await handleConfirmProvisionFlavor("ArrowRight", prompt("no"));

        expect(result.getAdminConsoleMode()?.selectedOption).toBe("yes");
    });

    it("should create the flavor", async () => {
        const result = await handleConfirmProvisionFlavor("Enter", prompt("yes"));

        expect(axiosPost).toHaveBeenCalledWith(
            "https://api.maxrosoff.com/admin/provision-flavor",
            { flavorName: "Fig", initialQuantity: 4, color: "purple", type: "upcoming" },
            expect.any(Object)
        );
        expect(result.getAdminConsoleMode()).toMatchObject({
            screen: AdminConsoleScreen.IceCreamInventory,
            provisionForm: undefined
        });
    });

    it("should show an error when creating fails", async () => {
        axiosPost.mockRejectedValue(new Error("offline"));

        const result = await handleConfirmProvisionFlavor("Enter", prompt("yes"));

        expect(result.getAdminConsoleMode()).toMatchObject({
            screen: AdminConsoleScreen.ConfirmProvisionFlavor,
            error: "Failed To Provision Flavor"
        });
    });

    it("should discard the flavor on no", async () => {
        const result = await handleConfirmProvisionFlavor("Enter", prompt("no"));

        expect(axiosPost).not.toHaveBeenCalled();
        expect(result.getAdminConsoleMode()?.screen).toBe(AdminConsoleScreen.IceCreamInventory);
    });

    it("should go back to the form on escape", async () => {
        const result = await handleConfirmProvisionFlavor("Escape", prompt("yes"));

        expect(result.getAdminConsoleMode()?.screen).toBe(AdminConsoleScreen.ProvisionFlavorForm);
    });

    it("should ignore other keys", async () => {
        const result = await handleConfirmProvisionFlavor("a", prompt("yes"));

        expect(result.getAdminConsoleMode()?.selectedOption).toBe("yes");
    });
});
