import { Box, Typography, keyframes, useMediaQuery, useTheme } from "@mui/material";

import type { AdminConsoleState } from "../../../javascript-terminal/emulator-state/EmulatorState";
import { useAppContext } from "../../AppContext";
import type { TerminalTheme } from "../Terminal";
import MenuItem from "./common/MenuItem";

const blink = keyframes`
    0%, 50% { visibility: visible; }
    50.01%, 100% { visibility: hidden; }
`;

const ConfirmSendEmailsMenu = (props: {
    theme?: TerminalTheme;
    onAction: (key: string) => void;
}) => {
    const { emulatorState } = useAppContext();
    const muiTheme = useTheme();
    const smallScreen = useMediaQuery(muiTheme.breakpoints.down("md"));
    const mode = emulatorState.getAdminConsoleMode() as AdminConsoleState;
    const selectedOption = mode.selectedOption as "yes" | "no";

    const select = (option: "yes" | "no") => {
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
            <Box sx={{ mb: 1 }}>
                <Typography
                    sx={{ color: props.theme?.outputColor || "#FCFCFC", fontSize: "0.9em" }}
                >
                    Message:
                </Typography>
                <Typography
                    sx={{
                        color: props.theme?.outputColor || "#FCFCFC",
                        paddingLeft: 2,
                        minHeight: "4.5em",
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere"
                    }}
                >
                    {mode.marketing?.message ? mode.marketing.message : " "}
                    <Box
                        component="span"
                        sx={{
                            display: "inline-block",
                            width: "8px",
                            height: "18px",
                            verticalAlign: "middle",
                            backgroundColor: props.theme?.outputColor || "#FCFCFC",
                            animation: `${blink} 1.2s step-end infinite`
                        }}
                    />
                </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                <MenuItem
                    selected={selectedOption === "yes"}
                    theme={props.theme}
                    disabled={mode.loading}
                    onClick={smallScreen ? () => select("yes") : undefined}
                >
                    Yes
                </MenuItem>
                <MenuItem
                    selected={selectedOption === "no"}
                    theme={props.theme}
                    disabled={mode.loading}
                    onClick={smallScreen ? () => select("no") : undefined}
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
                {mode.loading
                    ? "Sending..."
                    : smallScreen
                      ? "tap Yes or No"
                      : "type: message | left/right: select option | enter: confirm | escape: cancel"}
            </Typography>
        </Box>
    );
};

export default ConfirmSendEmailsMenu;
