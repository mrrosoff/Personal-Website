import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";

import { AdminConsoleState } from "../../../javascript-terminal/emulator-state/EmulatorState";
import { useAppContext } from "../../AppContext";
import { TerminalTheme } from "../Terminal";
import MenuItem from "./common/MenuItem";

const ConfirmProvisionFlavorMenu = (props: { theme?: TerminalTheme }) => {
    const { emulatorState } = useAppContext();
    const mode = emulatorState.getAdminConsoleMode() as AdminConsoleState;
    const [dots, setDots] = useState(".");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    const selectedOption = mode.selectedOption as "yes" | "no";
    const form = mode.provisionForm;
    if (!form) return null;

    return (
        <Box sx={{ paddingTop: 1 }}>
            <Typography
                sx={{
                    color: props.theme?.outputColor || "#FCFCFC",
                    fontWeight: "bold",
                    mb: 1.25
                }}
            >
                === Admin Console (Confirm Provision Flavor) ===
            </Typography>
            <Typography
                sx={{
                    color: props.theme?.outputColor || "#FCFCFC",
                    mb: 1
                }}
            >
                Please confirm the following details:
            </Typography>
            <Box sx={{ marginBottom: 8, paddingLeft: 2 }}>
                <Typography
                    sx={{ color: props.theme?.outputColor || "#FCFCFC", fontSize: "0.9em" }}
                >
                    Flavor Name: {form.flavorName}
                </Typography>
                <Typography
                    sx={{ color: props.theme?.outputColor || "#FCFCFC", fontSize: "0.9em" }}
                >
                    Initial Quantity: {form.initialQuantity}
                </Typography>
                <Typography
                    sx={{ color: props.theme?.outputColor || "#FCFCFC", fontSize: "0.9em" }}
                >
                    Color: {form.color}
                </Typography>
                <Typography
                    sx={{ color: props.theme?.outputColor || "#FCFCFC", fontSize: "0.9em" }}
                >
                    Type: {form.type || "Not Listed"}
                </Typography>
            </Box>
            <Typography
                sx={{
                    color: props.theme?.outputColor || "#FCFCFC",
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
                >
                    Yes
                </MenuItem>
                <MenuItem
                    selected={selectedOption === "no"}
                    theme={props.theme}
                    disabled={mode.loading}
                >
                    No
                </MenuItem>
            </Box>
            <Typography
                style={{
                    color: props.theme?.outputColor || "#FCFCFC",
                    fontSize: "0.9em",
                    opacity: 0.7
                }}
            >
                {mode.loading
                    ? `Loading${dots}`
                    : "left/right: select option | enter: confirm | escape: cancel"}
            </Typography>
        </Box>
    );
};

export default ConfirmProvisionFlavorMenu;
