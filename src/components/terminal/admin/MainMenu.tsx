import { Box, useMediaQuery, useTheme } from "@mui/material";

import { MainMenuOption } from "../../../javascript-terminal/emulator-state/EmulatorState";
import { useAppContext } from "../../AppContext";
import type { TerminalTheme } from "../Terminal";
import MenuItem from "./common/MenuItem";
import { ConsoleHeading, ConsoleHint } from "./common/ConsoleText";

const MainMenu = (props: { theme: TerminalTheme; onAction: (key: string) => void }) => {
    const { emulatorState } = useAppContext();
    const muiTheme = useTheme();
    const smallScreen = useMediaQuery(muiTheme.breakpoints.down("md"));
    const mode = emulatorState.getAdminConsoleMode()!;

    const select = (option: MainMenuOption) => {
        emulatorState.setAdminConsoleMode({ ...mode, selectedOption: option });
        props.onAction("Enter");
    };

    return (
        <Box sx={{ paddingTop: 1 }}>
            <ConsoleHeading theme={props.theme} />
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
                selected={mode.selectedOption === MainMenuOption.AddMailingListEntry}
                theme={props.theme}
                onClick={smallScreen ? () => select(MainMenuOption.AddMailingListEntry) : undefined}
            >
                3. Add To Mailing List
            </MenuItem>
            <MenuItem
                selected={mode.selectedOption === MainMenuOption.CreateFriendInvite}
                theme={props.theme}
                onClick={smallScreen ? () => select(MainMenuOption.CreateFriendInvite) : undefined}
            >
                4. Create Friend Invite
            </MenuItem>
            <MenuItem
                selected={mode.selectedOption === MainMenuOption.Exit}
                theme={props.theme}
                onClick={smallScreen ? () => select(MainMenuOption.Exit) : undefined}
            >
                5. Exit
            </MenuItem>
            <ConsoleHint theme={props.theme} spaced>
                {smallScreen
                    ? "tap an option to select"
                    : "use arrow keys to navigate, enter to select, escape to exit"}
            </ConsoleHint>
        </Box>
    );
};

export default MainMenu;
