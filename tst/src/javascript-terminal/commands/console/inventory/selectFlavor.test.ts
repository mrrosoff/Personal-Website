import { describe, expect, it } from "vitest";

import { mockAdminState } from "../../../../../helpers/terminal";
import { axiosPost } from "../../../../../__mocks__/axios";
import { mockFlavor } from "../../../../../__mocks__/__data__/aws/dynamodb";

import type { DatabaseFlavor } from "../../../../../../api/types";
import {
    fetchInventoryData,
    handleSelectFlavor,
    sortInventory
} from "../../../../../../src/javascript-terminal/commands/console/inventory/selectFlavor";
import { AdminConsoleScreen } from "../../../../../../src/javascript-terminal/emulator-state/EmulatorState";

function flavor(name: string, count: number, type: DatabaseFlavor["type"] = "currentFlavor") {
    return { ...mockFlavor, name, count, type };
}

const inventory = ["a", "b", "c", "d", "e", "f"].map((name, i) => flavor(name, 10 - i));

function selectAt(selectedOption: number, currentPage?: number) {
    return mockAdminState({
        screen: AdminConsoleScreen.SelectFlavor,
        inventoryData: inventory,
        selectedOption,
        currentPage
    });
}

describe("sortInventory", () => {
    it("should list current flavors first, then last batch, upcoming and unlisted", () => {
        const result = sortInventory([
            flavor("unlisted", 9, null),
            flavor("upcoming", 9, "upcoming"),
            flavor("last", 9, "lastBatch"),
            flavor("current", 1)
        ]);

        expect(result.map(({ name }) => name)).toEqual(["current", "last", "upcoming", "unlisted"]);
    });

    it("should put the fullest flavor first within a type", () => {
        const result = sortInventory([flavor("low", 1), flavor("high", 9)]);

        expect(result.map(({ name }) => name)).toEqual(["high", "low"]);
    });
});

describe("fetchInventoryData", () => {
    it("should load the inventory", async () => {
        axiosPost.mockResolvedValue({ data: { inventory: [mockFlavor] } });
        const state = mockAdminState({ screen: AdminConsoleScreen.SelectFlavor });

        await fetchInventoryData(state);

        expect(state.getAdminConsoleMode()?.inventoryData).toEqual([mockFlavor]);
    });

    it("should fill in missing fields", async () => {
        axiosPost.mockResolvedValue({ data: { inventory: [{}] } });
        const state = mockAdminState({ screen: AdminConsoleScreen.SelectFlavor });

        await fetchInventoryData(state);

        expect(state.getAdminConsoleMode()?.inventoryData).toEqual([
            {
                productId: "",
                priceId: "",
                name: "Unknown Flavor",
                color: "#000000",
                count: 0,
                type: null
            }
        ]);
    });

    it("should show an empty list and an error when loading fails", async () => {
        axiosPost.mockRejectedValue(new Error("offline"));
        const state = mockAdminState({ screen: AdminConsoleScreen.SelectFlavor });

        await fetchInventoryData(state);

        expect(state.getAdminConsoleMode()).toMatchObject({
            inventoryData: [],
            error: "Failed To Fetch Inventory"
        });
    });
});

describe("handleSelectFlavor", () => {
    it("should ignore keys while the inventory loads", () => {
        const state = mockAdminState({
            screen: AdminConsoleScreen.SelectFlavor,
            selectedOption: 0
        });

        handleSelectFlavor("ArrowDown", state);

        expect(state.getAdminConsoleMode()?.selectedOption).toBe(0);
    });

    it("should move down within the page", () => {
        const result = handleSelectFlavor("ArrowDown", selectAt(3));

        expect(result.getAdminConsoleMode()?.selectedOption).toBe(3);
    });

    it("should move up within the page", () => {
        const result = handleSelectFlavor("ArrowUp", selectAt(4, 1));

        expect(result.getAdminConsoleMode()?.selectedOption).toBe(4);
    });

    it("should turn to the next page", () => {
        const result = handleSelectFlavor("ArrowRight", selectAt(1));

        expect(result.getAdminConsoleMode()).toMatchObject({ currentPage: 1, selectedOption: 4 });
    });

    it("should not turn past the last page", () => {
        const result = handleSelectFlavor("ArrowRight", selectAt(4, 1));

        expect(result.getAdminConsoleMode()?.currentPage).toBe(1);
    });

    it("should turn to the previous page", () => {
        const result = handleSelectFlavor("ArrowLeft", selectAt(5, 1));

        expect(result.getAdminConsoleMode()).toMatchObject({ currentPage: 0, selectedOption: 0 });
    });

    it("should not turn before the first page", () => {
        const result = handleSelectFlavor("ArrowLeft", selectAt(1));

        expect(result.getAdminConsoleMode()?.selectedOption).toBe(1);
    });

    it("should open the selected flavor for editing", () => {
        const result = handleSelectFlavor("Enter", selectAt(2));

        expect(result.getAdminConsoleMode()).toMatchObject({
            screen: AdminConsoleScreen.IceCreamInventory,
            editingFlavor: inventory[2],
            inventoryData: undefined
        });
    });

    it("should go back to the inventory menu", () => {
        const result = handleSelectFlavor("Escape", selectAt(2));

        expect(result.getAdminConsoleMode()).toMatchObject({
            screen: AdminConsoleScreen.IceCreamInventory,
            selectedOption: "ModifyFlavorInventory"
        });
    });

    it("should ignore other keys", () => {
        const result = handleSelectFlavor("a", selectAt(2));

        expect(result.getAdminConsoleMode()?.selectedOption).toBe(2);
    });

    it("should rank unlisted flavors last whichever side they are on", () => {
        const result = sortInventory([flavor("current", 1), flavor("unlisted", 9, null)]);

        expect(result.map(({ name }) => name)).toEqual(["current", "unlisted"]);
    });
});
