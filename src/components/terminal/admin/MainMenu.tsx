import { Box, Typography } from "@mui/material";

import EmulatorState, {
    AdminConsoleState,
    AdminConsoleScreen,
    MainMenuOption,
    IceCreamInventoryMenuOption
} from "../../../javascript-terminal/emulator-state/EmulatorState";
import { TerminalTheme } from "../Terminal";
import MenuItem from "./common/MenuItem";

const MainMenu = (props: {
    mode: AdminConsoleState;
    theme?: TerminalTheme;
    emulatorState: EmulatorState;
}) => (
    <Box sx={{ paddingTop: 1 }}>
        <Typography
            sx={{
                color: props.theme?.outputColor || "#FCFCFC",
                fontWeight: "bold",
                mb: 1.25
            }}
        >
            === Admin Console ===
        </Typography>
        <MenuItem
            selected={props.mode.selectedOption === MainMenuOption.IceCreamInventory}
            theme={props.theme}
            onMouseEnter={() =>
                props.emulatorState.setAdminConsoleMode({
                    ...props.mode,
                    selectedOption: MainMenuOption.IceCreamInventory
                })
            }
            onClick={() =>
                props.emulatorState.setAdminConsoleMode({
                    ...props.mode,
                    screen: AdminConsoleScreen.IceCreamInventory,
                    selectedOption: IceCreamInventoryMenuOption.ProvisionNewFlavor
                })
            }
        >
            1. Ice Cream Inventory
        </MenuItem>
        <MenuItem
            selected={props.mode.selectedOption === MainMenuOption.SendMarketingEmails}
            theme={props.theme}
            onMouseEnter={() =>
                props.emulatorState.setAdminConsoleMode({
                    ...props.mode,
                    selectedOption: MainMenuOption.SendMarketingEmails
                })
            }
            onClick={() =>
                props.emulatorState.setAdminConsoleMode({
                    ...props.mode,
                    screen: AdminConsoleScreen.ConfirmSendEmails,
                    selectedOption: "yes"
                })
            }
        >
            2. Send Marketing Emails
        </MenuItem>
        <MenuItem
            selected={props.mode.selectedOption === MainMenuOption.Exit}
            theme={props.theme}
            onMouseEnter={() =>
                props.emulatorState.setAdminConsoleMode({
                    ...props.mode,
                    selectedOption: MainMenuOption.Exit
                })
            }
            onClick={() => props.emulatorState.setAdminConsoleMode(undefined)}
        >
            3. Exit
        </MenuItem>
        <Typography
            sx={{
                color: props.theme?.outputColor || "#FCFCFC",
                mt: 1,
                fontSize: "0.9em",
                opacity: 0.7
            }}
        >
            use arrow keys to navigate, enter to select, escape to exit
        </Typography>
    </Box>
);

export default MainMenu;
