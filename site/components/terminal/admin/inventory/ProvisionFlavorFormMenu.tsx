import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";

import { useAppContext } from "../../../AppContext";
import type {
    AdminConsoleMode,
    AdminConsoleScreen
} from "../../../../javascript-terminal/emulatorState/EmulatorState";
import type { TerminalTheme } from "../../Terminal";
import MenuItem from "../common/MenuItem";
import { ConsoleHeading, ConsoleHint } from "../common/ConsoleText";
import Stepper from "../common/Stepper";

type FormField = "flavorName" | "initialQuantity" | "color" | "type";

type ProvisionFlavorFormMenuProps = {
    theme: TerminalTheme;
    onAction: (key: string) => void;
    mode: AdminConsoleMode<AdminConsoleScreen.ProvisionFlavorForm>;
};

const ProvisionFlavorFormMenu = (props: ProvisionFlavorFormMenuProps) => {
    const { emulatorState } = useAppContext();
    const muiTheme = useTheme();
    const smallScreen = useMediaQuery(muiTheme.breakpoints.down("md"));
    const form = props.mode.provisionForm;

    const selectField = (field: FormField) => {
        emulatorState.setAdminConsoleMode({
            ...props.mode,
            provisionForm: { ...form, currentField: field }
        });
        props.onAction("");
    };

    const fields: { field: FormField; label: string; value: string | number }[] = [
        { field: "flavorName", label: "Flavor Name", value: form.flavorName || "_" },
        { field: "initialQuantity", label: "Initial Quantity", value: form.initialQuantity },
        { field: "color", label: "Color", value: form.color || "_" },
        { field: "type", label: "Type", value: form.type ?? "Not Listed" }
    ];

    return (
        <Box sx={{ paddingTop: 1 }}>
            <ConsoleHeading theme={props.theme} title={"Provision New Flavor"} />

            <Box sx={{ mb: 1 }}>
                {fields.map(({ field, label, value }) => {
                    const active = form.currentField === field;
                    return (
                        <Typography
                            key={field}
                            onClick={smallScreen ? () => selectField(field) : undefined}
                            sx={{
                                color: active ? props.theme.commandColor : props.theme.outputColor,
                                backgroundColor: active ? "rgba(255,255,255,0.1)" : "transparent",
                                padding: "4px 8px",
                                mb: 1,
                                cursor: smallScreen ? "pointer" : undefined
                            }}
                        >
                            {active ? "> " : "  "}
                            {label}:{" "}
                            {active && field === "type" && smallScreen ? (
                                <Stepper
                                    value={value}
                                    width={"13ch"}
                                    theme={props.theme}
                                    onStep={(key) => props.onAction(key)}
                                />
                            ) : (
                                <>
                                    {value}
                                    {active && field === "type" ? " (←/→ to change)" : ""}
                                </>
                            )}
                        </Typography>
                    );
                })}
            </Box>

            {smallScreen && (
                <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                    <MenuItem
                        selected={false}
                        theme={props.theme}
                        onClick={() => props.onAction("Enter")}
                    >
                        Continue
                    </MenuItem>
                    <MenuItem
                        selected={false}
                        theme={props.theme}
                        onClick={() => props.onAction("Escape")}
                    >
                        Cancel
                    </MenuItem>
                </Box>
            )}

            <ConsoleHint theme={props.theme}>
                {smallScreen
                    ? "tap a field to edit"
                    : "up/down: navigate fields | type to edit | enter: continue | escape: cancel"}
            </ConsoleHint>
        </Box>
    );
};

export default ProvisionFlavorFormMenu;
