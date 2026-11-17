import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";

import { useAppContext } from "../../../AppContext";
import type {
    AdminConsoleMode,
    AdminConsoleScreen
} from "../../../../javascript-terminal/emulatorState/EmulatorState";
import type { TerminalTheme } from "../../Terminal";
import MenuItem from "../common/MenuItem";
import { ConsoleHeading, ConsoleHint } from "../common/ConsoleText";
import useLoadingDots from "../common/useLoadingDots";

type ConfirmProvisionFlavorMenuProps = {
    theme: TerminalTheme;
    onAction: (key: string) => void;
    mode: AdminConsoleMode<AdminConsoleScreen.ConfirmProvisionFlavor>;
};

const ConfirmProvisionFlavorMenu = (props: ConfirmProvisionFlavorMenuProps) => {
    const { emulatorState } = useAppContext();
    const muiTheme = useTheme();
    const smallScreen = useMediaQuery(muiTheme.breakpoints.down("md"));
    const dots = useLoadingDots();

    const selectedOption = props.mode.selectedOption as "yes" | "no";
    const form = props.mode.provisionForm;

    const select = (option: "yes" | "no") => {
        emulatorState.setAdminConsoleMode({ ...props.mode, selectedOption: option });
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
                    Type: {form.type ?? "Not Listed"}
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
                    disabled={props.mode.loading}
                    onClick={smallScreen ? () => select("yes") : undefined}
                >
                    Yes
                </MenuItem>
                <MenuItem
                    selected={selectedOption === "no"}
                    theme={props.theme}
                    disabled={props.mode.loading}
                    onClick={smallScreen ? () => select("no") : undefined}
                >
                    No
                </MenuItem>
            </Box>
            <ConsoleHint theme={props.theme}>
                {props.mode.loading
                    ? `Loading${dots}`
                    : smallScreen
                      ? "tap Yes or No"
                      : "left/right: select option | enter: confirm | escape: cancel"}
            </ConsoleHint>
        </Box>
    );
};

export default ConfirmProvisionFlavorMenu;
