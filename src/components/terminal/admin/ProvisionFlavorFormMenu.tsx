import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";

import type { AdminConsoleState } from "../../../javascript-terminal/emulator-state/EmulatorState";
import { useAppContext } from "../../AppContext";
import type { TerminalTheme } from "../Terminal";
import MenuItem from "./common/MenuItem";

type FormField = "flavorName" | "initialQuantity" | "color" | "type";

const ProvisionFlavorFormMenu = (props: {
    theme?: TerminalTheme;
    onAction: (key: string) => void;
}) => {
    const { emulatorState } = useAppContext();
    const muiTheme = useTheme();
    const smallScreen = useMediaQuery(muiTheme.breakpoints.down("md"));
    const mode = emulatorState.getAdminConsoleMode() as AdminConsoleState;
    const form = mode.provisionForm;
    if (!form) return null;

    const selectField = (field: FormField) => {
        emulatorState.setAdminConsoleMode({
            ...mode,
            provisionForm: { ...form, currentField: field }
        });
        props.onAction("");
    };

    const fields: Array<{ field: FormField; label: string; value: string | number }> = [
        { field: "flavorName", label: "Flavor Name", value: form.flavorName || "_" },
        { field: "initialQuantity", label: "Initial Quantity", value: form.initialQuantity },
        { field: "color", label: "Color", value: form.color || "_" },
        { field: "type", label: "Type", value: form.type || "Not Listed" }
    ];

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
                {fields.map(({ field, label, value }) => {
                    const active = form.currentField === field;
                    return (
                        <Typography
                            key={field}
                            onClick={smallScreen ? () => selectField(field) : undefined}
                            sx={{
                                color: active
                                    ? props.theme?.commandColor || "#FFFFFF"
                                    : props.theme?.outputColor || "#FCFCFC",
                                backgroundColor: active ? "rgba(255,255,255,0.1)" : "transparent",
                                padding: "4px 8px",
                                mb: 1,
                                cursor: smallScreen ? "pointer" : undefined
                            }}
                        >
                            {active ? "> " : "  "}
                            {label}: {value}{" "}
                            {active && field === "type" ? (
                                smallScreen ? (
                                    <>
                                        {"  "}
                                        <Box
                                            component="span"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                props.onAction("ArrowLeft");
                                            }}
                                            sx={{ cursor: "pointer", px: 1 }}
                                        >
                                            ◀
                                        </Box>
                                        <Box
                                            component="span"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                props.onAction("ArrowRight");
                                            }}
                                            sx={{ cursor: "pointer", px: 1 }}
                                        >
                                            ▶
                                        </Box>
                                    </>
                                ) : (
                                    "(←/→ to change)"
                                )
                            ) : (
                                ""
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

            <Typography
                sx={{
                    color: props.theme?.outputColor || "#FCFCFC",
                    fontSize: "0.9em",
                    opacity: 0.7
                }}
            >
                {smallScreen
                    ? "tap a field to edit"
                    : "up/down: navigate fields | type to edit | enter: continue | escape: cancel"}
            </Typography>
        </Box>
    );
};

export default ProvisionFlavorFormMenu;
