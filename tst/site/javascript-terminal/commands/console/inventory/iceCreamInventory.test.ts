import { describe, expect, it } from "vitest";

import { mockAdminState } from "../../../../../helpers/terminal";
import { axiosPost } from "../../../../../mocks/axios";
import { mockFlavor } from "../../../../../fixtures/aws/dynamodb";

import { handleIceCreamInventory } from "../../../../../../site/javascript-terminal/commands/console/inventory/iceCreamInventory";
import {
    AdminConsoleScreen,
    IceCreamInventoryMenuOption
} from "../../../../../../site/javascript-terminal/emulatorState/EmulatorState";
import type { EditField } from "../../../../../../site/javascript-terminal/emulatorState/EmulatorState";

function menuAt(selectedOption: IceCreamInventoryMenuOption) {
    return mockAdminState({ screen: AdminConsoleScreen.IceCreamInventory, selectedOption });
}

function editing(editingField?: EditField) {
    return mockAdminState({
        screen: AdminConsoleScreen.IceCreamInventory,
        editingFlavor: mockFlavor,
        editingField
    });
}

describe("handleIceCreamInventory", () => {
    it("should move down the menu", async () => {
        const result = await handleIceCreamInventory(
            "ArrowDown",
            menuAt(IceCreamInventoryMenuOption.ProvisionNewFlavor)
        );

        expect(result.getAdminConsoleMode()?.selectedOption).toBe("ModifyFlavorInventory");
    });

    it("should open a blank flavor form", async () => {
        const result = await handleIceCreamInventory(
            "Enter",
            menuAt(IceCreamInventoryMenuOption.ProvisionNewFlavor)
        );

        expect(result.getAdminConsoleMode()).toMatchObject({
            screen: AdminConsoleScreen.ProvisionFlavorForm,
            provisionForm: { flavorName: "", initialQuantity: 2, color: "white", type: null }
        });
    });

    it("should load the inventory to pick a flavor", async () => {
        axiosPost.mockResolvedValue({ data: { inventory: [mockFlavor] } });

        const result = await handleIceCreamInventory(
            "Enter",
            menuAt(IceCreamInventoryMenuOption.ModifyFlavorInventory)
        );

        expect(result.getAdminConsoleMode()).toMatchObject({
            screen: AdminConsoleScreen.SelectFlavor,
            inventoryData: [mockFlavor]
        });
    });

    it("should go back to the main menu", async () => {
        const result = await handleIceCreamInventory(
            "Enter",
            menuAt(IceCreamInventoryMenuOption.GoBack)
        );

        expect(result.getAdminConsoleMode()).toMatchObject({
            screen: AdminConsoleScreen.Main,
            selectedOption: "IceCreamInventory"
        });
    });

    it("should go back to the main menu on escape", async () => {
        const result = await handleIceCreamInventory(
            "Escape",
            menuAt(IceCreamInventoryMenuOption.ProvisionNewFlavor)
        );

        expect(result.getAdminConsoleMode()?.screen).toBe(AdminConsoleScreen.Main);
    });

    it("should ignore other keys", async () => {
        const result = await handleIceCreamInventory(
            "a",
            menuAt(IceCreamInventoryMenuOption.ProvisionNewFlavor)
        );

        expect(result.getAdminConsoleMode()?.selectedOption).toBe("ProvisionNewFlavor");
    });
});

describe("editing a flavor", () => {
    it("should start on the name", async () => {
        const result = await handleIceCreamInventory("ArrowDown", editing());

        expect(result.getAdminConsoleMode()?.editingField).toBe("color");
    });

    it("should move up through the fields", async () => {
        const result = await handleIceCreamInventory("ArrowUp", editing("count"));

        expect(result.getAdminConsoleMode()?.editingField).toBe("type");
    });

    it("should cycle the type", async () => {
        const result = await handleIceCreamInventory("ArrowRight", editing("type"));

        expect(result.getAdminConsoleMode()?.editingFlavor?.type).toBe("lastBatch");
    });

    it("should change the count", async () => {
        const result = await handleIceCreamInventory("ArrowLeft", editing("count"));

        expect(result.getAdminConsoleMode()?.editingFlavor?.count).toBe(mockFlavor.count - 1);
    });

    it("should never count below zero", async () => {
        const state = mockAdminState({
            screen: AdminConsoleScreen.IceCreamInventory,
            editingFlavor: { ...mockFlavor, count: 0 },
            editingField: "count"
        });

        const result = await handleIceCreamInventory("ArrowLeft", state);

        expect(result.getAdminConsoleMode()?.editingFlavor?.count).toBe(0);
    });

    it("should not adjust a text field with arrows", async () => {
        const result = await handleIceCreamInventory("ArrowRight", editing("name"));

        expect(result.getAdminConsoleMode()?.editingFlavor).toEqual(mockFlavor);
    });

    it("should type into the name", async () => {
        const result = await handleIceCreamInventory("!", editing("name"));

        expect(result.getAdminConsoleMode()?.editingFlavor?.name).toBe(`${mockFlavor.name}!`);
    });

    it("should not type into the count", async () => {
        const result = await handleIceCreamInventory("7", editing("count"));

        expect(result.getAdminConsoleMode()?.editingFlavor).toEqual(mockFlavor);
    });

    it("should save the flavor and reload the list", async () => {
        axiosPost.mockResolvedValue({ data: { inventory: [mockFlavor] } });

        const result = await handleIceCreamInventory("Enter", editing("name"));

        expect(axiosPost).toHaveBeenCalledWith(
            "https://api.maxrosoff.com/admin/update-inventory",
            {
                productId: mockFlavor.productId,
                name: mockFlavor.name,
                color: mockFlavor.color,
                count: mockFlavor.count,
                type: mockFlavor.type
            },
            expect.any(Object)
        );
        expect(result.getAdminConsoleMode()).toMatchObject({
            screen: AdminConsoleScreen.SelectFlavor,
            editingFlavor: undefined,
            inventoryData: [mockFlavor]
        });
    });

    it("should show an error when saving fails", async () => {
        axiosPost.mockRejectedValue(new Error("offline"));

        const result = await handleIceCreamInventory("Enter", editing("name"));

        expect(result.getAdminConsoleMode()).toMatchObject({
            loading: false,
            error: "Failed To Update Flavor",
            editingFlavor: mockFlavor
        });
    });

    it("should stop editing on escape", async () => {
        const result = await handleIceCreamInventory("Escape", editing("name"));

        expect(result.getAdminConsoleMode()?.editingFlavor).toBeUndefined();
    });
});
