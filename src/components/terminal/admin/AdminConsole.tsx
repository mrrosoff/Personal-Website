import { Typography } from "@mui/material";

import { AdminConsoleScreen } from "../../../javascript-terminal/emulator-state/EmulatorState";
import { useAppContext } from "../../AppContext";
import type { TerminalTheme } from "../Terminal";
import MainMenu from "./MainMenu";
import IceCreamInventoryMenu from "./IceCreamInventoryMenu";
import SelectFlavorMenu from "./SelectFlavorMenu";
import ConfirmSendEmailsMenu from "./ConfirmSendEmailsMenu";
import ProvisionFlavorFormMenu from "./ProvisionFlavorFormMenu";
import ConfirmProvisionFlavorMenu from "./ConfirmProvisionFlavorMenu";
import CreateFriendInviteMenu from "./CreateFriendInviteMenu";

const AdminConsole = (props: { theme?: TerminalTheme; onAction: (key: string) => void }) => {
    const { emulatorState } = useAppContext();
    const mode = emulatorState.getAdminConsoleMode();
    if (!mode || !mode.screen) return null;

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
        }
    };

    return (
        <>
            {renderScreen()}
            {mode.error && (
                <Typography sx={{ color: props.theme?.errorColor || "#ff0606", mt: 1 }}>
                    {mode.error}
                </Typography>
            )}
        </>
    );
};

export default AdminConsole;
