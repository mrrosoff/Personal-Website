import { Typography } from "@mui/material";

import { AdminConsoleScreen } from "../../../javascript-terminal/emulator-state/EmulatorState";
import { useAppContext } from "../../AppContext";
import type { TerminalTheme } from "../Terminal";
import MainMenu from "./MainMenu";
import IceCreamInventoryMenu from "./inventory/IceCreamInventoryMenu";
import SelectFlavorMenu from "./inventory/SelectFlavorMenu";
import ConfirmSendEmailsMenu from "./mailingList/ConfirmSendEmailsMenu";
import ProvisionFlavorFormMenu from "./inventory/ProvisionFlavorFormMenu";
import ConfirmProvisionFlavorMenu from "./inventory/ConfirmProvisionFlavorMenu";
import CreateFriendInviteMenu from "./CreateFriendInviteMenu";
import AddMailingListEntryMenu from "./mailingList/AddMailingListEntryMenu";

const AdminConsole = (props: { theme: TerminalTheme; onAction: (key: string) => void }) => {
    const { emulatorState } = useAppContext();
    const mode = emulatorState.getAdminConsoleMode();
    if (!mode?.screen) return null;

    const renderScreen = () => {
        switch (mode.screen) {
            case AdminConsoleScreen.Main:
                return <MainMenu {...props} />;
            case AdminConsoleScreen.IceCreamInventory:
                return <IceCreamInventoryMenu {...props} />;
            case AdminConsoleScreen.SelectFlavor:
                return <SelectFlavorMenu {...props} />;
            case AdminConsoleScreen.ConfirmSendEmails:
                return <ConfirmSendEmailsMenu {...props} />;
            case AdminConsoleScreen.ProvisionFlavorForm:
                return <ProvisionFlavorFormMenu {...props} />;
            case AdminConsoleScreen.ConfirmProvisionFlavor:
                return <ConfirmProvisionFlavorMenu {...props} />;
            case AdminConsoleScreen.CreateFriendInvite:
                return <CreateFriendInviteMenu {...props} />;
            case AdminConsoleScreen.AddMailingListEntry:
                return <AddMailingListEntryMenu {...props} />;
        }
    };

    return (
        <>
            {renderScreen()}
            {mode.error && (
                <Typography sx={{ color: props.theme.errorColor, mt: 1 }}>{mode.error}</Typography>
            )}
        </>
    );
};

export default AdminConsole;
