import { AdminConsoleScreen } from "../../../javascript-terminal/emulator-state/EmulatorState";
import { useAppContext } from "../../AppContext";
import { TerminalTheme } from "../Terminal";
import MainMenu from "./MainMenu";
import IceCreamInventoryMenu from "./IceCreamInventoryMenu";
import SelectFlavorMenu from "./SelectFlavorMenu";
import ConfirmSendEmailsMenu from "./ConfirmSendEmailsMenu";
import ProvisionFlavorFormMenu from "./ProvisionFlavorFormMenu";
import ConfirmProvisionFlavorMenu from "./ConfirmProvisionFlavorMenu";
import CreateFriendInviteMenu from "./CreateFriendInviteMenu";

const AdminConsole = (props: { theme?: TerminalTheme }) => {
    const { emulatorState } = useAppContext();
    const mode = emulatorState.getAdminConsoleMode();
    if (!mode || !mode.screen) return null;

    switch (mode.screen) {
        case AdminConsoleScreen.Main:
            return <MainMenu theme={props.theme} />;
        case AdminConsoleScreen.IceCreamInventory:
            return <IceCreamInventoryMenu theme={props.theme} />;
        case AdminConsoleScreen.SelectFlavor:
            return <SelectFlavorMenu theme={props.theme} />;
        case AdminConsoleScreen.ConfirmSendEmails:
            return <ConfirmSendEmailsMenu theme={props.theme} />;
        case AdminConsoleScreen.ProvisionFlavorForm:
            return <ProvisionFlavorFormMenu theme={props.theme} />;
        case AdminConsoleScreen.ConfirmProvisionFlavor:
            return <ConfirmProvisionFlavorMenu theme={props.theme} />;
        case AdminConsoleScreen.CreateFriendInvite:
            return <CreateFriendInviteMenu theme={props.theme} />;
    }
};

export default AdminConsole;
