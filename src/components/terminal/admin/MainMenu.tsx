import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";

import {
    MainMenuOption,
    type AdminConsoleState
} from "../../../javascript-terminal/emulator-state/EmulatorState";
import { useAppContext } from "../../AppContext";
import type { TerminalTheme } from "../Terminal";
import MenuItem from "./common/MenuItem";

const MainMenu = (props: { theme?: TerminalTheme; onAction: (key: string) => void }) => {
    const { emulatorState } = useAppContext();
    const muiTheme = useTheme();
    const smallScreen = useMediaQuery(muiTheme.breakpoints.down("md"));
    const mode = emulatorState.getAdminConsoleMode() as AdminConsoleState;

    const select = (option: MainMenuOption) => {
        emulatorState.setAdminConsoleMode({ ...mode, selectedOption: option });
        props.onAction("Enter");
    };

    return (
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
                selected={mode.selectedOption === MainMenuOption.IceCreamInventory}
                theme={props.theme}
                onClick={smallScreen ? () => select(MainMenuOption.IceCreamInventory) : undefined}
            >
                1. Ice Cream Inventory
            </MenuItem>
            <MenuItem
                selected={mode.selectedOption === MainMenuOption.SendMarketingEmails}
                theme={props.theme}
                onClick={smallScreen ? () => select(MainMenuOption.SendMarketingEmails) : undefined}
            >
                2. Send Marketing Emails
            </MenuItem>
            <MenuItem
                selected={mode.selectedOption === MainMenuOption.CreateFriendInvite}
                theme={props.theme}
                onClick={smallScreen ? () => select(MainMenuOption.CreateFriendInvite) : undefined}
            >
                3. Create Friend Invite
            </MenuItem>
            <MenuItem
                selected={mode.selectedOption === MainMenuOption.Exit}
                theme={props.theme}
                onClick={smallScreen ? () => select(MainMenuOption.Exit) : undefined}
            >
                4. Exit
            </MenuItem>
            <Typography
                sx={{
                    color: props.theme?.outputColor || "#FCFCFC",
                    mt: 1,
                    fontSize: "0.9em",
                    opacity: 0.7
                }}
            >
                {smallScreen
                    ? "tap an option to select"
                    : "use arrow keys to navigate, enter to select, escape to exit"}
            </Typography>
        </Box>
    );
};

export default MainMenu;
