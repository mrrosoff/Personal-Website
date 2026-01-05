import axios from "axios";
import { Box, Typography } from "@mui/material";

import EmulatorState, {
    AdminConsoleState,
    AdminConsoleScreen,
    MainMenuOption
} from "../../../javascript-terminal/emulator-state/EmulatorState";
import { TerminalTheme } from "../Terminal";
import MenuItem from "./common/MenuItem";

const ConfirmSendEmailsMenu = (props: {
    mode: AdminConsoleState;
    theme?: TerminalTheme;
    emulatorState: EmulatorState;
}) => {
    const selectedOption = props.mode.selectedOption as "yes" | "no";

    const sendMarketingEmails = async () => {
        try {
            await axios.post(
                "https://api.maxrosoff.com/admin/send-marketing-emails",
                {},
                {
                    headers: { Authorization: `Bearer ${props.mode.authToken}` }
                }
            );
        } catch (err) {
            console.error("Failed to send marketing emails", err);
        }
    };

    const handleYesClick = async () => {
        await sendMarketingEmails();
        props.emulatorState.setAdminConsoleMode({
            ...props.mode,
            screen: AdminConsoleScreen.Main,
            selectedOption: MainMenuOption.SendMarketingEmails
        });
    };

    const handleNoClick = () => {
        props.emulatorState.setAdminConsoleMode({
            ...props.mode,
            screen: AdminConsoleScreen.Main,
            selectedOption: MainMenuOption.SendMarketingEmails
        });
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
                === Admin Console (Send Marketing Emails) ===
            </Typography>
            <Typography
                sx={{
                    color: props.theme?.outputColor || "#FCFCFC",
                    mb: 1
                }}
            >
                Are you sure you want to send marketing emails to all subscribers?
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                <MenuItem
                    selected={selectedOption === "yes"}
                    theme={props.theme}
                    onMouseEnter={() =>
                        props.emulatorState.setAdminConsoleMode({
                            ...props.mode,
                            selectedOption: "yes"
                        })
                    }
                    onClick={handleYesClick}
                >
                    Yes
                </MenuItem>
                <MenuItem
                    selected={selectedOption === "no"}
                    theme={props.theme}
                    onMouseEnter={() =>
                        props.emulatorState.setAdminConsoleMode({
                            ...props.mode,
                            selectedOption: "no"
                        })
                    }
                    onClick={handleNoClick}
                >
                    No
                </MenuItem>
            </Box>
            <Typography
                sx={{
                    color: props.theme?.outputColor || "#FCFCFC",
                    fontSize: "0.9em",
                    opacity: 0.7
                }}
            >
                left/right: select option | enter: confirm | escape: cancel
            </Typography>
        </Box>
    );
};

export default ConfirmSendEmailsMenu;
