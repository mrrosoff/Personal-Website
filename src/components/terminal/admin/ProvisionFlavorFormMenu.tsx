import { Box, Typography } from "@mui/material";

import EmulatorState, {
    AdminConsoleState
} from "../../../javascript-terminal/emulator-state/EmulatorState";
import { TerminalTheme } from "../Terminal";

const ProvisionFlavorFormMenu = (props: {
    mode: AdminConsoleState;
    theme?: TerminalTheme;
    emulatorState: EmulatorState;
}) => {
    const form = props.mode.provisionForm;
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
                === Admin Console (Provision New Flavor) ===
            </Typography>

            <Box sx={{ mb: 1 }}>
                <Typography
                    sx={{
                        color:
                            form.currentField === "flavorName"
                                ? props.theme?.commandColor || "#FFFFFF"
                                : props.theme?.outputColor || "#FCFCFC",
                        backgroundColor:
                            form.currentField === "flavorName"
                                ? "rgba(255,255,255,0.1)"
                                : "transparent",
                        padding: "4px 8px",
                        mb: 1
                    }}
                >
                    {form.currentField === "flavorName" ? "> " : "  "}Flavor Name:{" "}
                    {form.flavorName || "_"}
                </Typography>

                <Typography
                    sx={{
                        color:
                            form.currentField === "initialQuantity"
                                ? props.theme?.commandColor || "#FFFFFF"
                                : props.theme?.outputColor || "#FCFCFC",
                        backgroundColor:
                            form.currentField === "initialQuantity"
                                ? "rgba(255,255,255,0.1)"
                                : "transparent",
                        padding: "4px 8px",
                        mb: 1
                    }}
                >
                    {form.currentField === "initialQuantity" ? "> " : "  "}Initial Quantity:{" "}
                    {form.initialQuantity}
                </Typography>

                <Typography
                    sx={{
                        color:
                            form.currentField === "color"
                                ? props.theme?.commandColor || "#FFFFFF"
                                : props.theme?.outputColor || "#FCFCFC",
                        backgroundColor:
                            form.currentField === "color" ? "rgba(255,255,255,0.1)" : "transparent",
                        padding: "4px 8px",
                        mb: 1
                    }}
                >
                    {form.currentField === "color" ? "> " : "  "}Color: {form.color || "_"}
                </Typography>

                <Typography
                    sx={{
                        color:
                            form.currentField === "type"
                                ? props.theme?.commandColor || "#FFFFFF"
                                : props.theme?.outputColor || "#FCFCFC",
                        backgroundColor:
                            form.currentField === "type" ? "rgba(255,255,255,0.1)" : "transparent",
                        padding: "4px 8px",
                        mb: 1
                    }}
                >
                    {form.currentField === "type" ? "> " : "  "}Type: {form.type || "Not Listed"}{" "}
                    {form.currentField === "type" ? "(←/→ to change)" : ""}
                </Typography>
            </Box>

            <Typography
                sx={{
                    color: props.theme?.outputColor || "#FCFCFC",
                    fontSize: "0.9em",
                    opacity: 0.7
                }}
            >
                up/down: navigate fields | type to edit | enter: continue | escape: cancel
            </Typography>
        </Box>
    );
};

export default ProvisionFlavorFormMenu;
