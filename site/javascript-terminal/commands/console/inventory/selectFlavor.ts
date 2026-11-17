import type { DatabaseFlavor } from "../../../../../api/types";
import type EmulatorState from "../../../emulatorState/EmulatorState";
import {
    AdminConsoleScreen,
    IceCreamInventoryMenuOption
} from "../../../emulatorState/EmulatorState";
import { errorMessageFrom, postAsAdmin } from "../../console";

const ITEMS_PER_PAGE = 4;
const TYPE_ORDER: Record<string, number> = { currentFlavor: 3, lastBatch: 2, upcoming: 1 };

export function sortInventory(inventoryData: DatabaseFlavor[]): DatabaseFlavor[] {
    return [...inventoryData].sort((a, b) => {
        const typeA = TYPE_ORDER[a.type ?? ""] ?? 0;
        const typeB = TYPE_ORDER[b.type ?? ""] ?? 0;
        return typeA !== typeB ? typeB - typeA : b.count - a.count;
    });
}

export async function fetchInventoryData(state: EmulatorState): Promise<void> {
    try {
        const { inventory } = await postAsAdmin<{ inventory: Partial<DatabaseFlavor>[] }>(
            state,
            "/ice-cream/inventory"
        );
        const inventoryData = inventory.map((item) => ({
            productId: item.productId ?? "",
            priceId: item.priceId ?? "",
            name: item.name ?? "Unknown Flavor",
            color: item.color ?? "#000000",
            count: typeof item.count === "number" ? item.count : 0,
            type: item.type ?? null
        }));
        state.updateAdminConsoleMode({ inventoryData });
    } catch (err) {
        console.error("Failed To Fetch Inventory", err);
        state.updateAdminConsoleMode({
            inventoryData: [],
            error: errorMessageFrom(err, "Failed To Fetch Inventory")
        });
    }
}

export function handleSelectFlavor(key: string, state: EmulatorState): EmulatorState {
    const mode = state.getAdminConsoleModeOn(AdminConsoleScreen.SelectFlavor);
    if (!mode.inventoryData) return state;

    const sortedInventory = sortInventory(mode.inventoryData);
    const selectedIndex = mode.selectedOption as number;
    const currentPage = mode.currentPage ?? 0;
    const totalPages = Math.ceil(sortedInventory.length / ITEMS_PER_PAGE);
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, sortedInventory.length);

    const turnToPage = (page: number) => {
        state.setAdminConsoleMode({
            ...mode,
            currentPage: page,
            selectedOption: page * ITEMS_PER_PAGE
        });
    };

    switch (key) {
        case "ArrowDown":
            state.setAdminConsoleMode({
                ...mode,
                selectedOption: Math.min(selectedIndex + 1, endIndex - 1)
            });
            break;
        case "ArrowUp":
            state.setAdminConsoleMode({
                ...mode,
                selectedOption: Math.max(selectedIndex - 1, startIndex)
            });
            break;
        case "ArrowRight":
            if (currentPage < totalPages - 1) turnToPage(currentPage + 1);
            break;
        case "ArrowLeft":
            if (currentPage > 0) turnToPage(currentPage - 1);
            break;
        case "Enter":
            state.setAdminConsoleMode({
                ...mode,
                screen: AdminConsoleScreen.IceCreamInventory,
                editingFlavor: sortedInventory[selectedIndex],
                inventoryData: undefined,
                currentPage: 0
            });
            break;
        case "Escape":
            state.setAdminConsoleMode({
                ...mode,
                screen: AdminConsoleScreen.IceCreamInventory,
                selectedOption: IceCreamInventoryMenuOption.ModifyFlavorInventory,
                inventoryData: undefined,
                currentPage: 0
            });
            break;
    }

    return state;
}
