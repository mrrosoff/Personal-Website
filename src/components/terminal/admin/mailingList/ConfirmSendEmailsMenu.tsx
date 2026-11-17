import { Box, Typography, keyframes, useMediaQuery, useTheme } from "@mui/material";

import { useAppContext } from "../../../AppContext";
import type { TerminalTheme } from "../../Terminal";
import MenuItem from "../common/MenuItem";
import { ConsoleHeading, ConsoleHint } from "../common/ConsoleText";

const blink = keyframes`
    0%, 50% { visibility: visible; }
    50.01%, 100% { visibility: hidden; }
`;

const ConfirmSendEmailsMenu = (props: {
    theme: TerminalTheme;
    onAction: (key: string) => void;
}) => {
    const { emulatorState } = useAppContext();
    const muiTheme = useTheme();
    const smallScreen = useMediaQuery(muiTheme.breakpoints.down("md"));
    const mode = emulatorState.getAdminConsoleMode()!;
    const selectedOption = mode.selectedOption as "yes" | "no";

    const select = (option: "yes" | "no") => {
        emulatorState.setAdminConsoleMode({ ...mode, selectedOption: option });
        props.onAction("Enter");
    };

    return (
        <Box sx={{ paddingTop: 1 }}>
            <ConsoleHeading theme={props.theme} title={"Send Marketing Emails"} />
            <Typography
                sx={{
                    color: props.theme.outputColor,
                    mb: 1
                }}
            >
                Are you sure you want to send marketing emails to all subscribers?
            </Typography>
            <Typography
                sx={{
                    color: props.theme.outputColor,
                    mb: 1,
                    minHeight: "4.5em",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere"
                }}
            >
                {"Message: "}
                {mode.marketing?.message}
                <Box
                    component="span"
                    sx={{
                        display: "inline-block",
                        width: "8px",
                        height: "18px",
                        verticalAlign: "middle",
                        backgroundColor: props.theme.outputColor,
                        animation: `${blink} 1.2s step-end infinite`
                    }}
                />
            </Typography>
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
            <ConsoleHint theme={props.theme}>
                {mode.loading
                    ? "Sending..."
                    : smallScreen
                      ? "tap Yes or No"
                      : "type: message | left/right: select option | enter: confirm | escape: cancel"}
            </ConsoleHint>
        </Box>
    );
};

export default ConfirmSendEmailsMenu;
