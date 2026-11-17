import EmulatorState, {
    type AdminConsoleState,
    AdminConsoleScreen,
    IceCreamInventoryMenuOption,
    MainMenuOption
} from "../../emulator-state/EmulatorState";
import { SHARE_TOKEN_DEFAULT_HOURS } from "../../../../api/common";
import { arrowStep, stepWithin } from "../console";

const MAIN_MENU_OPTIONS = [
    MainMenuOption.IceCreamInventory,
    MainMenuOption.SendMarketingEmails,
    MainMenuOption.AddMailingListEntry,
    MainMenuOption.CreateFriendInvite,
    MainMenuOption.Exit
];

function openSelectedScreen(mode: AdminConsoleState): AdminConsoleState | undefined {
    switch (mode.selectedOption) {
        case MainMenuOption.IceCreamInventory:
            return {
                ...mode,
                screen: AdminConsoleScreen.IceCreamInventory,
                selectedOption: IceCreamInventoryMenuOption.ProvisionNewFlavor
            };
        case MainMenuOption.SendMarketingEmails:
            return {
                ...mode,
                screen: AdminConsoleScreen.ConfirmSendEmails,
                selectedOption: "yes",
                marketing: { message: "" }
            };
        case MainMenuOption.CreateFriendInvite:
            return {
                ...mode,
                screen: AdminConsoleScreen.CreateFriendInvite,
                friendInvite: {
                    friendName: "",
                    email: "",
                    durationHours: SHARE_TOKEN_DEFAULT_HOURS,
                    deviceIds: [],
                    deviceIndex: 0,
                    currentField: "friendName"
                }
            };
        case MainMenuOption.AddMailingListEntry:
            return {
                ...mode,
                screen: AdminConsoleScreen.AddMailingListEntry,
                mailingListEntry: {
                    firstName: "",
                    lastName: "",
                    email: "",
                    currentField: "firstName"
                }
            };
        default:
            return undefined;
    }
}

export function handleMainMenu(key: string, state: EmulatorState): EmulatorState {
    const mode = state.getAdminConsoleModeOn(AdminConsoleScreen.Main);
    switch (key) {
        case "ArrowDown":
        case "ArrowUp":
            state.setAdminConsoleMode({
                ...mode,
                selectedOption: stepWithin(
                    MAIN_MENU_OPTIONS,
                    mode.selectedOption as MainMenuOption,
                    arrowStep(key)
                )
            });
            break;
        case "Enter":
            state.setAdminConsoleMode(openSelectedScreen(mode));
            break;
        case "Escape":
            state.setAdminConsoleMode(undefined);
            break;
    }

    return state;
}
