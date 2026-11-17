import { Box, useMediaQuery, useTheme } from "@mui/material";

import type { AdminConsoleScreen } from "../../../javascript-terminal/emulator-state/EmulatorState";
import { MainMenuOption } from "../../../javascript-terminal/emulator-state/EmulatorState";
import type { AdminConsoleMode } from "../../../javascript-terminal/emulator-state/EmulatorState";
import { useAppContext } from "../../AppContext";
import type { TerminalTheme } from "../Terminal";
import MenuItem from "./common/MenuItem";
import { ConsoleHeading, ConsoleHint } from "./common/ConsoleText";

type MainMenuProps = {
    theme: TerminalTheme;
    onAction: (key: string) => void;
    mode: AdminConsoleMode<AdminConsoleScreen.Main>;
};

const MainMenu = (props: MainMenuProps) => {
    const { emulatorState } = useAppContext();
    const muiTheme = useTheme();
    const smallScreen = useMediaQuery(muiTheme.breakpoints.down("md"));

    const select = (option: MainMenuOption) => {
        emulatorState.setAdminConsoleMode({ ...props.mode, selectedOption: option });
        props.onAction("Enter");
    };

    return (
        <Box sx={{ paddingTop: 1 }}>
            <ConsoleHeading theme={props.theme} />
            <MenuItem
                selected={props.mode.selectedOption === MainMenuOption.IceCreamInventory}
                theme={props.theme}
                onClick={smallScreen ? () => select(MainMenuOption.IceCreamInventory) : undefined}
            >
                1. Ice Cream Inventory
            </MenuItem>
            <MenuItem
                selected={props.mode.selectedOption === MainMenuOption.SendMarketingEmails}
                theme={props.theme}
                onClick={smallScreen ? () => select(MainMenuOption.SendMarketingEmails) : undefined}
            >
                2. Send Marketing Emails
            </MenuItem>
            <MenuItem
                selected={props.mode.selectedOption === MainMenuOption.AddMailingListEntry}
                theme={props.theme}
                onClick={smallScreen ? () => select(MainMenuOption.AddMailingListEntry) : undefined}
            >
                3. Add To Mailing List
            </MenuItem>
            <MenuItem
                selected={props.mode.selectedOption === MainMenuOption.CreateFriendInvite}
                theme={props.theme}
                onClick={smallScreen ? () => select(MainMenuOption.CreateFriendInvite) : undefined}
            >
                4. Create Friend Invite
            </MenuItem>
            <MenuItem
                selected={props.mode.selectedOption === MainMenuOption.Exit}
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
