import EmulatorState, {
    AdminConsoleScreen,
    IceCreamInventoryMenuOption
} from "../../../emulator-state/EmulatorState";
import { postAsAdmin, setAdminConsoleError } from "../../console";

export async function handleConfirmProvisionFlavor(
    key: string,
    state: EmulatorState
): Promise<EmulatorState> {
    const mode = state.getAdminConsoleMode()!;
    const form = mode.provisionForm!;

    switch (key) {
        case "ArrowLeft":
        case "ArrowRight":
            state.setAdminConsoleMode({
                ...mode,
                selectedOption: mode.selectedOption === "yes" ? "no" : "yes"
            });
            break;
        case "Enter":
            if (mode.selectedOption === "yes") {
                state.setAdminConsoleMode({ ...mode, loading: true });
                try {
                    await postAsAdmin(state, "/admin/provision-flavor", {
                        flavorName: form.flavorName,
                        initialQuantity: form.initialQuantity,
                        color: form.color,
                        type: form.type
                    });
                } catch (err) {
                    setAdminConsoleError(state, err, "Failed To Provision Flavor");
                    break;
                }
            }
            state.setAdminConsoleMode({
                ...mode,
                screen: AdminConsoleScreen.IceCreamInventory,
                selectedOption: IceCreamInventoryMenuOption.ProvisionNewFlavor,
                provisionForm: undefined,
                loading: false
            });
            break;
        case "Escape":
            state.setAdminConsoleMode({ ...mode, screen: AdminConsoleScreen.ProvisionFlavorForm });
            break;
    }

    return state;
}
