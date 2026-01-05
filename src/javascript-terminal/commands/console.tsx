import assert from "assert";
import axios from "axios";
import EmulatorState, {
    AdminConsoleScreen,
    MainMenuOption,
    IceCreamInventoryMenuOption,
    ProvisionFlavorForm
} from "../emulator-state/EmulatorState";
import { FLAVOR_TYPES, FlavorType } from "../../../api/types";
import { API_URL } from "../../components/App";

export const optDef = {};

const MAIN_MENU_OPTIONS = [
    MainMenuOption.IceCreamInventory,
    MainMenuOption.SendMarketingEmails,
    MainMenuOption.Exit
];

const ICE_CREAM_INVENTORY_MENU_OPTIONS = [
    IceCreamInventoryMenuOption.ProvisionNewFlavor,
    IceCreamInventoryMenuOption.ModifyFlavorInventory,
    IceCreamInventoryMenuOption.GoBack
];

const FLAVOR_TYPE_OPTIONS: Array<FlavorType | null> = [...FLAVOR_TYPES, null];

const getNextFlavorType = (currentType: FlavorType | null): FlavorType | null => {
    const currentIndex = FLAVOR_TYPE_OPTIONS.indexOf(currentType);
    const nextIndex = (currentIndex + 1) % FLAVOR_TYPE_OPTIONS.length;
    return FLAVOR_TYPE_OPTIONS[nextIndex];
};

const getPreviousFlavorType = (currentType: FlavorType | null): FlavorType | null => {
    const currentIndex = FLAVOR_TYPE_OPTIONS.indexOf(currentType);
    const previousIndex =
        (currentIndex - 1 + FLAVOR_TYPE_OPTIONS.length) % FLAVOR_TYPE_OPTIONS.length;
    return FLAVOR_TYPE_OPTIONS[previousIndex];
};

const functionDef = (state: EmulatorState, _commandOptions: string[]) => {
    try {
        const existingMode = state.getAdminConsoleMode();
        if (existingMode?.screen) {
            return {
                output: "",
                type: "text"
            };
        }

        const environmentVariables = state.getEnvVariables();
        const authToken = environmentVariables["AUTH_TOKEN"];
        if (!authToken) {
            return { output: "Permission Denied", type: "error" };
        }

        state.setAdminConsoleMode({
            screen: AdminConsoleScreen.Main,
            selectedOption: MainMenuOption.IceCreamInventory
        });

        return {
            output: "",
            type: "text"
        };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const handleAdminConsoleKeyPress = async (
    key: string,
    emulatorState: EmulatorState,
    ctrlKey: boolean = false
): Promise<EmulatorState> => {
    const mode = emulatorState.getAdminConsoleMode();
    if (!mode) return emulatorState;

    if (key === "c" && ctrlKey) {
        emulatorState.setAdminConsoleMode(undefined);
        return emulatorState;
    }

    if (mode.screen === "main") {
        return handleMainMenu(key, emulatorState);
    } else if (mode.screen === "ice-cream-inventory") {
        return await handleIceCreamInventory(key, emulatorState);
    } else if (mode.screen === "select-flavor") {
        return handleSelectFlavor(key, emulatorState);
    } else if (mode.screen === "confirm-send-emails") {
        return await handleConfirmSendEmails(key, emulatorState);
    } else if (mode.screen === "provision-flavor-form") {
        return handleProvisionFlavorForm(key, emulatorState);
    } else if (mode.screen === "confirm-provision-flavor") {
        return await handleConfirmProvisionFlavor(key, emulatorState);
    }

    return emulatorState;
};

const handleMainMenu = (key: string, state: EmulatorState): EmulatorState => {
    const mode = state.getAdminConsoleMode()!;
    const currentOption = mode.selectedOption as MainMenuOption;
    const currentIndex = MAIN_MENU_OPTIONS.indexOf(currentOption);

    switch (key) {
        case "ArrowDown": {
            const nextIndex = Math.min(currentIndex + 1, MAIN_MENU_OPTIONS.length - 1);
            state.setAdminConsoleMode({
                ...mode,
                selectedOption: MAIN_MENU_OPTIONS[nextIndex]
            });
            break;
        }
        case "ArrowUp": {
            const prevIndex = Math.max(currentIndex - 1, 0);
            state.setAdminConsoleMode({
                ...mode,
                selectedOption: MAIN_MENU_OPTIONS[prevIndex]
            });
            break;
        }
        case "Enter":
            switch (currentOption) {
                case MainMenuOption.IceCreamInventory:
                    state.setAdminConsoleMode({
                        ...mode,
                        screen: AdminConsoleScreen.IceCreamInventory,
                        selectedOption: IceCreamInventoryMenuOption.ProvisionNewFlavor
                    });
                    break;
                case MainMenuOption.SendMarketingEmails:
                    state.setAdminConsoleMode({
                        ...mode,
                        screen: AdminConsoleScreen.ConfirmSendEmails,
                        selectedOption: "yes"
                    });
                    break;
                case MainMenuOption.Exit:
                    state.setAdminConsoleMode(undefined);
                    break;
            }
            break;
        case "Escape":
            state.setAdminConsoleMode(undefined);
            break;
    }

    return state;
};

const handleIceCreamInventory = async (
    key: string,
    state: EmulatorState
): Promise<EmulatorState> => {
    const mode = state.getAdminConsoleMode()!;
    if (mode.editingFlavor) {
        return handleFlavorEdit(key, state);
    }

    const currentOption = mode.selectedOption as IceCreamInventoryMenuOption;
    const currentIndex = ICE_CREAM_INVENTORY_MENU_OPTIONS.indexOf(currentOption);

    switch (key) {
        case "ArrowDown": {
            const nextIndex = Math.min(
                currentIndex + 1,
                ICE_CREAM_INVENTORY_MENU_OPTIONS.length - 1
            );
            state.setAdminConsoleMode({
                ...mode,
                selectedOption: ICE_CREAM_INVENTORY_MENU_OPTIONS[nextIndex]
            });
            break;
        }
        case "ArrowUp": {
            const prevIndex = Math.max(currentIndex - 1, 0);
            state.setAdminConsoleMode({
                ...mode,
                selectedOption: ICE_CREAM_INVENTORY_MENU_OPTIONS[prevIndex]
            });
            break;
        }
        case "Enter":
            await handleIceCreamMenuSelection(state);
            break;
        case "Escape":
            state.setAdminConsoleMode({
                ...mode,
                screen: AdminConsoleScreen.Main,
                selectedOption: MainMenuOption.IceCreamInventory,
                inventoryData: undefined
            });
            break;
    }

    return state;
};

const handleFlavorEdit = (key: string, state: EmulatorState): EmulatorState => {
    const mode = state.getAdminConsoleMode()!;
    if (!mode.editingFlavor) return state;

    switch (key) {
        case "ArrowUp":
            state.setAdminConsoleMode({
                ...mode,
                editingFlavor: {
                    ...mode.editingFlavor,
                    count: mode.editingFlavor.count + 1
                }
            });
            break;
        case "ArrowDown":
            state.setAdminConsoleMode({
                ...mode,
                editingFlavor: {
                    ...mode.editingFlavor,
                    count: Math.max(0, mode.editingFlavor.count - 1)
                }
            });
            break;
        case "ArrowRight":
            state.setAdminConsoleMode({
                ...mode,
                editingFlavor: {
                    ...mode.editingFlavor,
                    type: getNextFlavorType(mode.editingFlavor.type)
                }
            });
            break;
        case "ArrowLeft":
            state.setAdminConsoleMode({
                ...mode,
                editingFlavor: {
                    ...mode.editingFlavor,
                    type: getPreviousFlavorType(mode.editingFlavor.type)
                }
            });
            break;
        case "Enter":
            updateFlavorInventory(
                state,
                mode.editingFlavor.productId,
                mode.editingFlavor.name,
                mode.editingFlavor.color,
                mode.editingFlavor.count,
                mode.editingFlavor.type
            );
            const newMode = {
                ...mode,
                editingFlavor: undefined
            };
            state.setAdminConsoleMode(newMode);
            fetchInventoryData(state);
            break;
        case "Escape":
            state.setAdminConsoleMode({
                ...mode,
                editingFlavor: undefined
            });
            break;
    }

    return state;
};

const handleIceCreamMenuSelection = async (state: EmulatorState) => {
    const mode = state.getAdminConsoleMode()!;
    const currentOption = mode.selectedOption as IceCreamInventoryMenuOption;

    switch (currentOption) {
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
        case IceCreamInventoryMenuOption.ModifyFlavorInventory: {
            const newMode = {
                ...mode,
                screen: AdminConsoleScreen.SelectFlavor,
                selectedOption: 0,
                currentPage: 0
            };
            state.setAdminConsoleMode(newMode);
            await fetchInventoryData(state);
            break;
        }
        case IceCreamInventoryMenuOption.GoBack:
            state.setAdminConsoleMode({
                ...mode,
                screen: AdminConsoleScreen.Main,
                selectedOption: MainMenuOption.IceCreamInventory,
                inventoryData: undefined
            });
            break;
    }
};

const handleSelectFlavor = (key: string, state: EmulatorState): EmulatorState => {
    const mode = state.getAdminConsoleMode()!;
    if (!mode.inventoryData) return state;

    // Sort inventory the same way as SelectFlavorMenu component
    const typeOrder = { current: 2, lastBatch: 1, upcoming: 0 };
    const sortedInventory = [...mode.inventoryData].sort((a, b) => {
        const typeA = typeOrder[a.type as keyof typeof typeOrder];
        const typeB = typeOrder[b.type as keyof typeof typeOrder];

        if (typeA !== typeB) {
            return typeB - typeA;
        }

        return b.count - a.count;
    });

    const ITEMS_PER_PAGE = 4;
    const selectedIndex = mode.selectedOption as number;
    const currentPage = mode.currentPage ?? 0;
    const totalItems = sortedInventory.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);

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
            if (currentPage < totalPages - 1) {
                const newPage = currentPage + 1;
                const newStartIndex = newPage * ITEMS_PER_PAGE;
                state.setAdminConsoleMode({
                    ...mode,
                    currentPage: newPage,
                    selectedOption: newStartIndex
                });
            }
            break;
        case "ArrowLeft":
            if (currentPage > 0) {
                const newPage = currentPage - 1;
                const newStartIndex = newPage * ITEMS_PER_PAGE;
                state.setAdminConsoleMode({
                    ...mode,
                    currentPage: newPage,
                    selectedOption: newStartIndex
                });
            }
            break;
        case "Enter":
            const flavor = sortedInventory[selectedIndex];
            state.setAdminConsoleMode({
                ...mode,
                screen: AdminConsoleScreen.IceCreamInventory,
                editingFlavor: flavor,
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
};

const handleConfirmSendEmails = async (
    key: string,
    state: EmulatorState
): Promise<EmulatorState> => {
    const mode = state.getAdminConsoleMode()!;
    const authToken = state.getEnvVariables()["AUTH_TOKEN"];
    const currentOption = mode.selectedOption as "yes" | "no";

    switch (key) {
        case "ArrowLeft":
        case "ArrowRight":
            state.setAdminConsoleMode({
                ...mode,
                selectedOption: currentOption === "yes" ? "no" : "yes"
            });
            break;
        case "Enter":
            if (currentOption === "yes") {
                await sendMarketingEmails(authToken);
            }
            state.setAdminConsoleMode({
                ...mode,
                screen: AdminConsoleScreen.Main,
                selectedOption: MainMenuOption.SendMarketingEmails
            });
            break;
        case "Escape":
            state.setAdminConsoleMode({
                ...mode,
                screen: AdminConsoleScreen.Main,
                selectedOption: MainMenuOption.SendMarketingEmails
            });
            break;
    }

    return state;
};

const handleProvisionFlavorForm = (key: string, state: EmulatorState): EmulatorState => {
    const mode = state.getAdminConsoleMode()!;
    if (!mode.provisionForm) return state;

    const form = mode.provisionForm;
    const fields: Array<"flavorName" | "initialQuantity" | "color" | "type"> = [
        "flavorName",
        "initialQuantity",
        "color",
        "type"
    ];
    const currentIndex = fields.indexOf(form.currentField);

    switch (key) {
        case "ArrowDown":
        case "Tab": {
            const nextIndex = (currentIndex + 1) % fields.length;
            state.setAdminConsoleMode({
                ...mode,
                provisionForm: {
                    ...form,
                    currentField: fields[nextIndex]
                }
            });
            break;
        }
        case "ArrowUp": {
            const prevIndex = (currentIndex - 1 + fields.length) % fields.length;
            state.setAdminConsoleMode({
                ...mode,
                provisionForm: {
                    ...form,
                    currentField: fields[prevIndex]
                }
            });
            break;
        }
        case "ArrowLeft":
            if (form.currentField === "type") {
                state.setAdminConsoleMode({
                    ...mode,
                    provisionForm: {
                        ...form,
                        type: getPreviousFlavorType(form.type)
                    }
                });
            }
            break;
        case "ArrowRight":
            if (form.currentField === "type") {
                state.setAdminConsoleMode({
                    ...mode,
                    provisionForm: {
                        ...form,
                        type: getNextFlavorType(form.type)
                    }
                });
            }
            break;
        case "Enter":
            state.setAdminConsoleMode({
                ...mode,
                screen: AdminConsoleScreen.ConfirmProvisionFlavor,
                selectedOption: "yes"
            });
            break;
        case "Escape":
            state.setAdminConsoleMode({
                ...mode,
                screen: AdminConsoleScreen.IceCreamInventory,
                selectedOption: IceCreamInventoryMenuOption.ProvisionNewFlavor,
                provisionForm: undefined
            });
            break;
        default:
            if (key.length === 1 || key === "Backspace") {
                handleProvisionFormInput(key, state);
            }
            break;
    }

    return state;
};

const handleProvisionFormInput = (key: string, state: EmulatorState) => {
    const mode = state.getAdminConsoleMode()!;
    if (!mode.provisionForm) return;

    const form = mode.provisionForm;

    switch (form.currentField) {
        case "flavorName":
            if (key === "Backspace") {
                state.setAdminConsoleMode({
                    ...mode,
                    provisionForm: {
                        ...form,
                        flavorName: form.flavorName.slice(0, -1)
                    }
                });
            } else if (key.length === 1) {
                state.setAdminConsoleMode({
                    ...mode,
                    provisionForm: {
                        ...form,
                        flavorName: form.flavorName + key
                    }
                });
            }
            break;
        case "initialQuantity":
            if (key === "Backspace") {
                const newValue = Math.floor(form.initialQuantity / 10);
                state.setAdminConsoleMode({
                    ...mode,
                    provisionForm: {
                        ...form,
                        initialQuantity: newValue
                    }
                });
            } else if (key >= "0" && key <= "9") {
                const newValue = form.initialQuantity * 10 + parseInt(key);
                state.setAdminConsoleMode({
                    ...mode,
                    provisionForm: {
                        ...form,
                        initialQuantity: Math.min(newValue, 9999)
                    }
                });
            }
            break;
        case "color":
            if (key === "Backspace") {
                state.setAdminConsoleMode({
                    ...mode,
                    provisionForm: {
                        ...form,
                        color: form.color.slice(0, -1)
                    }
                });
            } else if (key.length === 1 && form.color.length < 7) {
                state.setAdminConsoleMode({
                    ...mode,
                    provisionForm: {
                        ...form,
                        color: form.color + key
                    }
                });
            }
            break;
    }
};

const handleConfirmProvisionFlavor = async (
    key: string,
    state: EmulatorState
): Promise<EmulatorState> => {
    const mode = state.getAdminConsoleMode()!;
    const authToken = state.getEnvVariables()["AUTH_TOKEN"];
    const currentOption = mode.selectedOption as "yes" | "no";

    switch (key) {
        case "ArrowLeft":
        case "ArrowRight":
            state.setAdminConsoleMode({
                ...mode,
                selectedOption: currentOption === "yes" ? "no" : "yes"
            });
            break;
        case "Enter":
            if (currentOption === "yes" && mode.provisionForm) {
                await provisionNewFlavor(mode.provisionForm, authToken);
            }
            state.setAdminConsoleMode({
                ...mode,
                screen: AdminConsoleScreen.IceCreamInventory,
                selectedOption: IceCreamInventoryMenuOption.ProvisionNewFlavor,
                provisionForm: undefined
            });
            break;
        case "Escape":
            state.setAdminConsoleMode({
                ...mode,
                screen: AdminConsoleScreen.ProvisionFlavorForm
            });
            break;
    }

    return state;
};

const fetchInventoryData = async (state: EmulatorState) => {
    const mode = state.getAdminConsoleMode()!;
    const authToken = state.getEnvVariables()["AUTH_TOKEN"];
    if (!authToken) return;

    try {
        const { data } = await axios.post(
            `${API_URL}/ice-cream/inventory`,
            {},
            {
                headers: { Authorization: `Bearer ${authToken}` }
            }
        );

        const inventoryData = data.inventory.map((item: any) => ({
            productId: item.productId || "",
            priceId: item.priceId || "",
            name: item.name || "Unknown Flavor",
            color: item.color || "#000000",
            count: typeof item.count === "number" ? item.count : 0,
            type: item.type || "upcoming"
        }));

        state.setAdminConsoleMode({
            ...mode,
            inventoryData
        });
    } catch (err) {
        console.error("Failed To Fetch Inventory", err);
        state.setAdminConsoleMode({
            ...mode,
            inventoryData: []
        });
    }
};

const provisionNewFlavor = async (form: ProvisionFlavorForm, authToken: string) => {
    try {
        const { data } = await axios.post(
            "https://api.maxrosoff.com/admin/provision-flavor",
            {
                flavorName: form.flavorName,
                initialQuantity: form.initialQuantity,
                color: form.color,
                type: form.type
            },
            {
                headers: { Authorization: `Bearer ${authToken}` }
            }
        );
        console.log("Provision flavor result:", data);
        return data;
    } catch (err) {
        console.error("Failed to provision flavor", err);
    }
};

const updateFlavorInventory = async (
    state: EmulatorState,
    productId: string,
    name: string,
    color: string,
    count: number,
    type: FlavorType | null
) => {
    const authToken = state.getEnvVariables()["AUTH_TOKEN"];
    try {
        const { data } = await axios.post(
            "https://api.maxrosoff.com/admin/update-inventory",
            { productId, name, color, count, type },
            {
                headers: { Authorization: `Bearer ${authToken}` }
            }
        );
        console.log("Update inventory result:", data);
        return data;
    } catch (err) {
        console.error("Failed to update inventory", err);
    }
};

const sendMarketingEmails = async (authToken: string) => {
    try {
        const { data } = await axios.post(
            "https://api.maxrosoff.com/email/send-emails",
            {},
            {
                headers: { Authorization: `Bearer ${authToken}` }
            }
        );
        return data;
    } catch (err) {
        console.error("Failed to send marketing emails", err);
    }
};

export const manPage = `NAME
     console -- admin console interface

SYNOPSIS
     console

DESCRIPTION
     Opens the administrative console for managing ice cream inventory and
     sending marketing emails. Requires authentication via password prompt.`;

export default { optDef, functionDef };
