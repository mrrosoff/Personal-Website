import EmulatorState, {
    AdminConsoleScreen,
    IceCreamInventoryMenuOption,
    type ProvisionFlavorForm
} from "../../../emulator-state/EmulatorState";
import { arrowStep, cycleFlavorType, editNumber, editText, stepAround } from "../../console";

const FORM_FIELDS: ProvisionFlavorForm["currentField"][] = [
    "flavorName",
    "initialQuantity",
    "color",
    "type"
];

function typeIntoForm(form: ProvisionFlavorForm, key: string): ProvisionFlavorForm {
    switch (form.currentField) {
        case "initialQuantity":
            return { ...form, initialQuantity: editNumber(form.initialQuantity, key, 9999) };
        case "type":
            return form;
        default:
            return { ...form, [form.currentField]: editText(form[form.currentField], key) };
    }
}

export function handleProvisionFlavorForm(key: string, state: EmulatorState): EmulatorState {
    const mode = state.getAdminConsoleModeOn(AdminConsoleScreen.ProvisionFlavorForm);
    const form = mode.provisionForm;

    switch (key) {
        case "ArrowDown":
        case "ArrowUp":
        case "Tab":
            state.setAdminConsoleMode({
                ...mode,
                provisionForm: {
                    ...form,
                    currentField: stepAround(FORM_FIELDS, form.currentField, arrowStep(key))
                }
            });
            break;
        case "ArrowLeft":
        case "ArrowRight":
            if (form.currentField === "type") {
                state.setAdminConsoleMode({
                    ...mode,
                    provisionForm: { ...form, type: cycleFlavorType(form.type, arrowStep(key)) }
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
            state.setAdminConsoleMode({ ...mode, provisionForm: typeIntoForm(form, key) });
    }

    return state;
}
