import type { DatabaseFlavor } from "../../../../../api/types";
import type EmulatorState from "../../../emulator-state/EmulatorState";
import {
    type AdminConsoleState,
    AdminConsoleScreen,
    type EditField,
    IceCreamInventoryMenuOption,
    MainMenuOption
} from "../../../emulator-state/EmulatorState";
import {
    arrowStep,
    cycleFlavorType,
    editText,
    postAsAdmin,
    setAdminConsoleError,
    stepWithin
} from "../../console";
import { fetchInventoryData } from "./selectFlavor";

const ICE_CREAM_INVENTORY_MENU_OPTIONS = [
    IceCreamInventoryMenuOption.ProvisionNewFlavor,
    IceCreamInventoryMenuOption.ModifyFlavorInventory,
    IceCreamInventoryMenuOption.GoBack
];

const EDIT_FIELDS: EditField[] = ["name", "color", "type", "count"];

function returnToMainMenu(mode: AdminConsoleState): AdminConsoleState {
    return {
        ...mode,
        screen: AdminConsoleScreen.Main,
        selectedOption: MainMenuOption.IceCreamInventory,
        inventoryData: undefined
    };
}

async function openSelectedOption(state: EmulatorState, mode: AdminConsoleState): Promise<void> {
    switch (mode.selectedOption) {
        case IceCreamInventoryMenuOption.ProvisionNewFlavor:
            state.setAdminConsoleMode({
                ...mode,
                screen: AdminConsoleScreen.ProvisionFlavorForm,
                provisionForm: {
                    flavorName: "",
                    initialQuantity: 2,
                    color: "white",
                    type: null,
                    currentField: "flavorName"
                }
            });
            break;
        case IceCreamInventoryMenuOption.ModifyFlavorInventory:
            state.setAdminConsoleMode({
                ...mode,
                screen: AdminConsoleScreen.SelectFlavor,
                selectedOption: 0,
                currentPage: 0
            });
            await fetchInventoryData(state);
            break;
        default:
            state.setAdminConsoleMode(returnToMainMenu(mode));
    }
}

function adjustFlavor(flavor: DatabaseFlavor, field: EditField, step: number): DatabaseFlavor {
    if (field === "type") {
        return { ...flavor, type: cycleFlavorType(flavor.type, step) };
    }
    if (field === "count") {
        return { ...flavor, count: Math.max(0, flavor.count + step) };
    }
    return flavor;
}

function typeIntoFlavor(flavor: DatabaseFlavor, field: EditField, key: string): DatabaseFlavor {
    if (field === "name" || field === "color") {
        return { ...flavor, [field]: editText(flavor[field], key) };
    }
    return flavor;
}

async function handleFlavorEdit(
    key: string,
    state: EmulatorState,
    mode: AdminConsoleState,
    flavor: DatabaseFlavor
): Promise<EmulatorState> {
    const field = mode.editingField ?? "name";

    switch (key) {
        case "ArrowUp":
        case "ArrowDown":
            state.setAdminConsoleMode({
                ...mode,
                editingField: stepWithin(EDIT_FIELDS, field, arrowStep(key))
            });
            break;
        case "ArrowLeft":
        case "ArrowRight":
            state.setAdminConsoleMode({
                ...mode,
                editingFlavor: adjustFlavor(flavor, field, arrowStep(key))
            });
            break;
        case "Enter":
            state.setAdminConsoleMode({ ...mode, loading: true });
            try {
                await postAsAdmin(state, "/admin/update-inventory", {
                    productId: flavor.productId,
                    name: flavor.name,
                    color: flavor.color,
                    count: flavor.count,
                    type: flavor.type
                });
            } catch (err) {
                setAdminConsoleError(state, err, "Failed To Update Flavor");
                break;
            }
            state.setAdminConsoleMode({
                ...mode,
                screen: AdminConsoleScreen.SelectFlavor,
                editingFlavor: undefined,
                editingField: undefined,
                selectedOption: 0,
                currentPage: 0,
                loading: false
            });
            await fetchInventoryData(state);
            break;
        case "Escape":
            state.setAdminConsoleMode({
                ...mode,
                editingFlavor: undefined,
                editingField: undefined
            });
            break;
        default:
            state.setAdminConsoleMode({
                ...mode,
                editingFlavor: typeIntoFlavor(flavor, field, key)
            });
    }

    return state;
}

export async function handleIceCreamInventory(
    key: string,
    state: EmulatorState
): Promise<EmulatorState> {
    const mode = state.getAdminConsoleModeOn(AdminConsoleScreen.IceCreamInventory);
    if (mode.editingFlavor) {
        return handleFlavorEdit(key, state, mode, mode.editingFlavor);
    }

    switch (key) {
        case "ArrowDown":
        case "ArrowUp":
            state.setAdminConsoleMode({
                ...mode,
                selectedOption: stepWithin(
                    ICE_CREAM_INVENTORY_MENU_OPTIONS,
                    mode.selectedOption,
                    arrowStep(key)
                )
            });
            break;
        case "Enter":
            await openSelectedOption(state, mode);
            break;
        case "Escape":
            state.setAdminConsoleMode(returnToMainMenu(mode));
            break;
    }

    return state;
}
