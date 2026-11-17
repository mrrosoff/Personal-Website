import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";

import { useAppContext } from "../../../AppContext";
import type { TerminalTheme } from "../../Terminal";
import MenuItem from "../common/MenuItem";
import { ConsoleHeading, ConsoleHint } from "../common/ConsoleText";
import useLoadingDots from "../common/useLoadingDots";

const ConfirmProvisionFlavorMenu = (props: {
    theme: TerminalTheme;
    onAction: (key: string) => void;
}) => {
    const { emulatorState } = useAppContext();
    const muiTheme = useTheme();
    const smallScreen = useMediaQuery(muiTheme.breakpoints.down("md"));
    const mode = emulatorState.getAdminConsoleMode()!;
    const dots = useLoadingDots();

    const selectedOption = mode.selectedOption as "yes" | "no";
    const form = mode.provisionForm!;

    const select = (option: "yes" | "no") => {
        emulatorState.setAdminConsoleMode({ ...mode, selectedOption: option });
        props.onAction("Enter");
    };

    return (
        <Box sx={{ paddingTop: 1 }}>
            <ConsoleHeading theme={props.theme} title={"Confirm Provision Flavor"} />
            <Typography
                sx={{
                    color: props.theme.outputColor,
                    mb: 1
                }}
            >
                Please confirm the following details:
            </Typography>
            <Box sx={{ marginBottom: 8, paddingLeft: 2 }}>
                <Typography sx={{ color: props.theme.outputColor, fontSize: "0.9em" }}>
                    Flavor Name: {form.flavorName}
                </Typography>
                <Typography sx={{ color: props.theme.outputColor, fontSize: "0.9em" }}>
                    Initial Quantity: {form.initialQuantity}
                </Typography>
                <Typography sx={{ color: props.theme.outputColor, fontSize: "0.9em" }}>
                    Color: {form.color}
                </Typography>
                <Typography sx={{ color: props.theme.outputColor, fontSize: "0.9em" }}>
                    Type: {form.type || "Not Listed"}
                </Typography>
            </Box>
            <Typography
                sx={{
                    color: props.theme.outputColor,
                    mb: 1
                }}
            >
                Provision this flavor?
            </Typography>
            <Box sx={{ display: "flex", gap: 2, marginBottom: 8 }}>
                <MenuItem
                    selected={selectedOption === "yes"}
                    theme={props.theme}
                    disabled={mode.loading}
                    onClick={
                        smallScreen
                            ? () => {
                                  select("yes");
                              }
                            : undefined
                    }
                >
                    Yes
                </MenuItem>
                <MenuItem
                    selected={selectedOption === "no"}
                    theme={props.theme}
                    disabled={mode.loading}
                    onClick={
                        smallScreen
                            ? () => {
                                  select("no");
                              }
                            : undefined
                    }
                >
                    No
                </MenuItem>
            </Box>
            <ConsoleHint theme={props.theme}>
                {mode.loading
                    ? `Loading${dots}`
                    : smallScreen
                      ? "tap Yes or No"
                      : "left/right: select option | enter: confirm | escape: cancel"}
            </ConsoleHint>
        </Box>
    );
};

export default ConfirmProvisionFlavorMenu;
