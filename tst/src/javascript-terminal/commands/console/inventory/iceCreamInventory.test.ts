import { describe, expect, it } from "vitest";

import { mockAdminState } from "../../../../../helpers/terminal";
import { axiosPost } from "../../../../../__mocks__/axios";
import { mockFlavor } from "../../../../../__mocks__/__data__/aws/dynamodb";

import { handleAdminConsoleKeyPress } from "../../../../../../src/javascript-terminal/commands/console";
import {
    AdminConsoleScreen,
    type EditField,
    IceCreamInventoryMenuOption
} from "../../../../../../src/javascript-terminal/emulator-state/EmulatorState";

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
        const result = await handleAdminConsoleKeyPress(
            "ArrowDown",
            menuAt(IceCreamInventoryMenuOption.ProvisionNewFlavor)
        );

        expect(result.getAdminConsoleMode()?.selectedOption).toBe("ModifyFlavorInventory");
    });

    it("should open a blank flavor form", async () => {
        const result = await handleAdminConsoleKeyPress(
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

        const result = await handleAdminConsoleKeyPress(
            "Enter",
            menuAt(IceCreamInventoryMenuOption.ModifyFlavorInventory)
        );

        expect(result.getAdminConsoleMode()).toMatchObject({
            screen: AdminConsoleScreen.SelectFlavor,
            inventoryData: [mockFlavor]
        });
    });

    it("should go back to the main menu", async () => {
        const result = await handleAdminConsoleKeyPress(
            "Enter",
            menuAt(IceCreamInventoryMenuOption.GoBack)
        );

        expect(result.getAdminConsoleMode()).toMatchObject({
            screen: AdminConsoleScreen.Main,
            selectedOption: "IceCreamInventory"
        });
    });

    it("should go back to the main menu on escape", async () => {
        const result = await handleAdminConsoleKeyPress(
            "Escape",
            menuAt(IceCreamInventoryMenuOption.ProvisionNewFlavor)
        );

        expect(result.getAdminConsoleMode()?.screen).toBe(AdminConsoleScreen.Main);
    });

    it("should ignore other keys", async () => {
        const result = await handleAdminConsoleKeyPress(
            "a",
            menuAt(IceCreamInventoryMenuOption.ProvisionNewFlavor)
        );

        expect(result.getAdminConsoleMode()?.selectedOption).toBe("ProvisionNewFlavor");
    });
});

describe("editing a flavor", () => {
    it("should start on the name", async () => {
        const result = await handleAdminConsoleKeyPress("ArrowDown", editing());

        expect(result.getAdminConsoleMode()?.editingField).toBe("color");
    });

    it("should move up through the fields", async () => {
        const result = await handleAdminConsoleKeyPress("ArrowUp", editing("count"));

        expect(result.getAdminConsoleMode()?.editingField).toBe("type");
    });

    it("should cycle the type", async () => {
        const result = await handleAdminConsoleKeyPress("ArrowRight", editing("type"));

        expect(result.getAdminConsoleMode()?.editingFlavor?.type).toBe("lastBatch");
    });

    it("should change the count", async () => {
        const result = await handleAdminConsoleKeyPress("ArrowLeft", editing("count"));

        expect(result.getAdminConsoleMode()?.editingFlavor?.count).toBe(mockFlavor.count - 1);
    });

    it("should never count below zero", async () => {
        const state = mockAdminState({
            screen: AdminConsoleScreen.IceCreamInventory,
            editingFlavor: { ...mockFlavor, count: 0 },
            editingField: "count"
        });

        const result = await handleAdminConsoleKeyPress("ArrowLeft", state);

        expect(result.getAdminConsoleMode()?.editingFlavor?.count).toBe(0);
    });

    it("should not adjust a text field with arrows", async () => {
        const result = await handleAdminConsoleKeyPress("ArrowRight", editing("name"));

        expect(result.getAdminConsoleMode()?.editingFlavor).toEqual(mockFlavor);
    });

    it("should type into the name", async () => {
        const result = await handleAdminConsoleKeyPress("!", editing("name"));

        expect(result.getAdminConsoleMode()?.editingFlavor?.name).toBe(`${mockFlavor.name}!`);
    });

    it("should not type into the count", async () => {
        const result = await handleAdminConsoleKeyPress("7", editing("count"));

        expect(result.getAdminConsoleMode()?.editingFlavor).toEqual(mockFlavor);
    });

    it("should save the flavor and reload the list", async () => {
        axiosPost.mockResolvedValue({ data: { inventory: [mockFlavor] } });

        const result = await handleAdminConsoleKeyPress("Enter", editing("name"));

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

        const result = await handleAdminConsoleKeyPress("Enter", editing("name"));

        expect(result.getAdminConsoleMode()).toMatchObject({
            loading: false,
            error: "Failed To Update Flavor",
            editingFlavor: mockFlavor
        });
    });

    it("should stop editing on escape", async () => {
        const result = await handleAdminConsoleKeyPress("Escape", editing("name"));

        expect(result.getAdminConsoleMode()?.editingFlavor).toBeUndefined();
    });
});
