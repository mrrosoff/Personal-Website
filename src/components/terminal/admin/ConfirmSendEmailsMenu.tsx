import { Box, Typography } from "@mui/material";

import { AdminConsoleState } from "../../../javascript-terminal/emulator-state/EmulatorState";
import { useAppContext } from "../../AppContext";
import { TerminalTheme } from "../Terminal";
import MenuItem from "./common/MenuItem";

const ConfirmSendEmailsMenu = (props: { theme?: TerminalTheme }) => {
    const { emulatorState } = useAppContext();
    const mode = emulatorState.getAdminConsoleMode() as AdminConsoleState;
    const selectedOption = mode.selectedOption as "yes" | "no";

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
                <MenuItem selected={selectedOption === "yes"} theme={props.theme}>
                    Yes
                </MenuItem>
                <MenuItem selected={selectedOption === "no"} theme={props.theme}>
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
