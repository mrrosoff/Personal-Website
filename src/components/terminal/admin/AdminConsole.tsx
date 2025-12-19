import EmulatorState, {
    AdminConsoleScreen
} from "../../../javascript-terminal/emulator-state/EmulatorState";
import { TerminalTheme } from "../Terminal";
import MainMenu from "./MainMenu";
import IceCreamInventoryMenu from "./IceCreamInventoryMenu";
import SelectFlavorMenu from "./SelectFlavorMenu";
import ConfirmSendEmailsMenu from "./ConfirmSendEmailsMenu";
import ProvisionFlavorFormMenu from "./ProvisionFlavorFormMenu";
import ConfirmProvisionFlavorMenu from "./ConfirmProvisionFlavorMenu";

const AdminConsole = (props: { emulatorState: EmulatorState; theme?: TerminalTheme }) => {
    const mode = props.emulatorState.getAdminConsoleMode();
    if (!mode || !mode.screen) return null;

    switch (mode.screen) {
        case AdminConsoleScreen.Main:
            return <MainMenu mode={mode} theme={props.theme} emulatorState={props.emulatorState} />;
        case AdminConsoleScreen.IceCreamInventory:
            return (
                <IceCreamInventoryMenu
                    mode={mode}
                    theme={props.theme}
                    emulatorState={props.emulatorState}
                />
            );
        case AdminConsoleScreen.SelectFlavor:
            return (
                <SelectFlavorMenu
                    mode={mode}
                    theme={props.theme}
                    emulatorState={props.emulatorState}
                />
            );
        case AdminConsoleScreen.ConfirmSendEmails:
            return (
                <ConfirmSendEmailsMenu
                    mode={mode}
                    theme={props.theme}
                    emulatorState={props.emulatorState}
                />
            );
        case AdminConsoleScreen.ProvisionFlavorForm:
            return (
                <ProvisionFlavorFormMenu
                    mode={mode}
                    theme={props.theme}
                    emulatorState={props.emulatorState}
                />
            );
        case AdminConsoleScreen.ConfirmProvisionFlavor:
            return (
                <ConfirmProvisionFlavorMenu
                    mode={mode}
                    theme={props.theme}
                    emulatorState={props.emulatorState}
                />
            );
    }
};

export default AdminConsole;
