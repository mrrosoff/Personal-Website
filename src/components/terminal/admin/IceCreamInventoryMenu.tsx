import { useState, useEffect } from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";

import {
    type AdminConsoleState,
    IceCreamInventoryMenuOption
} from "../../../javascript-terminal/emulator-state/EmulatorState";
import { useAppContext } from "../../AppContext";
import type { TerminalTheme } from "../Terminal";
import MenuItem from "./common/MenuItem";

type EditField = "name" | "color" | "type" | "count";

const IceCreamInventoryMenu = (props: {
    theme?: TerminalTheme;
    onAction: (key: string) => void;
}) => {
    const { emulatorState } = useAppContext();
    const muiTheme = useTheme();
    const smallScreen = useMediaQuery(muiTheme.breakpoints.down("md"));
    const mode = emulatorState.getAdminConsoleMode() as AdminConsoleState;
    const [dots, setDots] = useState(".");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    const selectOption = (option: IceCreamInventoryMenuOption) => {
        emulatorState.setAdminConsoleMode({ ...mode, selectedOption: option });
        props.onAction("Enter");
    };

    const selectField = (field: EditField) => {
        emulatorState.setAdminConsoleMode({ ...mode, editingField: field });
        props.onAction("");
    };

    if (mode.editingFlavor) {
        return (
            <Box sx={{ paddingTop: 1 }}>
                <Typography
                    sx={{
                        color: props.theme?.outputColor || "#FCFCFC",
                        fontWeight: "bold",
                        mb: 1.25
                    }}
                >
                    === Admin Console (Modify Flavor Inventory) ===
                </Typography>
                <Box sx={{ opacity: mode.loading ? 0.4 : 1 }}>
                    {(["name", "color", "type", "count"] as const).map((field) => {
                        const active = (mode.editingField || "name") === field;
                        let value: string;
                        if (field === "type") value = mode.editingFlavor!.type || "Not Listed";
                        else if (field === "count") value = String(mode.editingFlavor!.count);
                        else value = mode.editingFlavor![field] || "_";
                        const stepper = field === "type" || field === "count";
                        return (
                            <Typography
                                key={field}
                                onClick={
                                    smallScreen && !mode.loading
                                        ? () => selectField(field)
                                        : undefined
                                }
                                sx={{
                                    color: active
                                        ? props.theme?.commandColor || "#FFFFFF"
                                        : props.theme?.outputColor || "#FCFCFC",
                                    backgroundColor: active
                                        ? "rgba(255,255,255,0.1)"
                                        : "transparent",
                                    padding: "4px 8px",
                                    mb: field === "count" ? 2 : 1,
                                    cursor: smallScreen ? "pointer" : undefined
                                }}
                            >
                                {active ? "> " : "  "}
                                {field.charAt(0).toUpperCase() + field.slice(1)}: {value}
                                {active && stepper && smallScreen ? (
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
                                ) : active && stepper ? (
                                    " (←/→ to change)"
                                ) : (
                                    ""
                                )}
                            </Typography>
                        );
                    })}
                </Box>
                {smallScreen && !mode.loading && (
                    <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                        <MenuItem
                            selected={false}
                            theme={props.theme}
                            onClick={() => props.onAction("Enter")}
                        >
                            Save
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
                    {mode.loading
                        ? `Loading${dots}`
                        : smallScreen
                          ? "tap a field to edit, then Save"
                          : "up/down: select field | type: edit | left/right: change value | enter: save | escape: cancel"}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ paddingTop: 1 }}>
            <Typography
                sx={{
                    color: props.theme?.outputColor || "#FCFCFC",
                    fontWeight: "bold",
                    mb: 1.25
                }}
            >
                === Admin Console (Ice Cream Inventory) ===
            </Typography>
            <MenuItem
                selected={mode.selectedOption === IceCreamInventoryMenuOption.ProvisionNewFlavor}
                theme={props.theme}
                onClick={
                    smallScreen
                        ? () => selectOption(IceCreamInventoryMenuOption.ProvisionNewFlavor)
                        : undefined
                }
            >
                1. Provision New Flavor
            </MenuItem>
            <MenuItem
                selected={mode.selectedOption === IceCreamInventoryMenuOption.ModifyFlavorInventory}
                theme={props.theme}
                onClick={
                    smallScreen
                        ? () => selectOption(IceCreamInventoryMenuOption.ModifyFlavorInventory)
                        : undefined
                }
            >
                2. Modify Flavor Inventory
            </MenuItem>
            <MenuItem
                selected={mode.selectedOption === IceCreamInventoryMenuOption.GoBack}
                theme={props.theme}
                onClick={
                    smallScreen ? () => selectOption(IceCreamInventoryMenuOption.GoBack) : undefined
                }
            >
                3. Go Back
            </MenuItem>
            <Typography
                sx={{
                    color: props.theme?.outputColor || "#FCFCFC",
                    mt: 1,
                    fontSize: "0.9em",
                    opacity: 0.7
                }}
            >
                {smallScreen
                    ? "tap an option to select"
                    : "use arrow keys to navigate, enter to select, escape to go back"}
            </Typography>
        </Box>
    );
};

export default IceCreamInventoryMenu;
