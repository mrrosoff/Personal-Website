import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";

import EmulatorState, {
    AdminConsoleState,
    IceCreamInventoryMenuOption
} from "../../../javascript-terminal/emulator-state/EmulatorState";
import { TerminalTheme } from "../Terminal";
import MenuItem from "./common/MenuItem";

const IceCreamInventoryMenu = (props: { theme?: TerminalTheme; emulatorState: EmulatorState }) => {
    const mode = props.emulatorState.getAdminConsoleMode() as AdminConsoleState;
    const [dots, setDots] = useState(".");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
        }, 500);
        return () => clearInterval(interval);
    }, []);

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
                        return (
                            <Typography
                                key={field}
                                sx={{
                                    color: active
                                        ? props.theme?.commandColor || "#FFFFFF"
                                        : props.theme?.outputColor || "#FCFCFC",
                                    backgroundColor: active
                                        ? "rgba(255,255,255,0.1)"
                                        : "transparent",
                                    padding: "4px 8px",
                                    mb: field === "count" ? 2 : 1
                                }}
                            >
                                {active ? "> " : "  "}
                                {field.charAt(0).toUpperCase() + field.slice(1)}: {value}
                                {active && (field === "type" || field === "count")
                                    ? " (←/→ to change)"
                                    : ""}
                            </Typography>
                        );
                    })}
                </Box>
                <Typography
                    sx={{
                        color: props.theme?.outputColor || "#FCFCFC",
                        fontSize: "0.9em",
                        opacity: 0.7
                    }}
                >
                    {mode.loading
                        ? `Loading${dots}`
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
            >
                1. Provision New Flavor
            </MenuItem>
            <MenuItem
                selected={mode.selectedOption === IceCreamInventoryMenuOption.ModifyFlavorInventory}
                theme={props.theme}
            >
                2. Modify Flavor Inventory
            </MenuItem>
            <MenuItem
                selected={mode.selectedOption === IceCreamInventoryMenuOption.GoBack}
                theme={props.theme}
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
                use arrow keys to navigate, enter to select, escape to go back
            </Typography>
        </Box>
    );
};

export default IceCreamInventoryMenu;
