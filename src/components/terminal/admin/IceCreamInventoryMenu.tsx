import axios from "axios";
import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";

import { DatabaseFlavor } from "../../../../api/types";
import EmulatorState, {
    AdminConsoleState,
    AdminConsoleScreen,
    IceCreamInventoryMenuOption,
    MainMenuOption
} from "../../../javascript-terminal/emulator-state/EmulatorState";
import { TerminalTheme } from "../Terminal";
import MenuItem from "./common/MenuItem";
import { API_URL } from "../../App";

const IceCreamInventoryMenu = (props: { theme?: TerminalTheme; emulatorState: EmulatorState }) => {
    const mode = props.emulatorState.getAdminConsoleMode() as AdminConsoleState;
    const [dots, setDots] = useState(".");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    const provisionNewFlavor = () => {
        props.emulatorState.setAdminConsoleMode({
            ...mode,
            screen: AdminConsoleScreen.ProvisionFlavorForm,
            selectedOption: 0,
            provisionForm: {
                flavorName: "",
                initialQuantity: 0,
                color: "",
                type: null,
                currentField: "flavorName"
            }
        });
    };

    const handleModifyInventory = async () => {
        const newMode = {
            ...mode,
            screen: AdminConsoleScreen.SelectFlavor,
            selectedOption: 0
        };
        props.emulatorState.setAdminConsoleMode(newMode);

        const authToken = props.emulatorState.getEnvVariables()["AUTH_TOKEN"];
        const { data } = await axios.post<{ inventory: DatabaseFlavor[] }>(
            `${API_URL}/ice-cream/inventory`,
            {},
            {
                headers: { Authorization: `Bearer ${authToken}` }
            }
        );
        props.emulatorState.setAdminConsoleMode({ ...newMode, inventoryData: data.inventory });
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
                onMouseEnter={() =>
                    props.emulatorState.setAdminConsoleMode({
                        ...mode,
                        selectedOption: IceCreamInventoryMenuOption.ProvisionNewFlavor
                    })
                }
                onClick={provisionNewFlavor}
            >
                1. Provision New Flavor
            </MenuItem>
            <MenuItem
                selected={mode.selectedOption === IceCreamInventoryMenuOption.ModifyFlavorInventory}
                theme={props.theme}
                onMouseEnter={() =>
                    props.emulatorState.setAdminConsoleMode({
                        ...mode,
                        selectedOption: IceCreamInventoryMenuOption.ModifyFlavorInventory
                    })
                }
                onClick={handleModifyInventory}
            >
                2. Modify Flavor Inventory
            </MenuItem>
            <MenuItem
                selected={mode.selectedOption === IceCreamInventoryMenuOption.GoBack}
                theme={props.theme}
                onMouseEnter={() =>
                    props.emulatorState.setAdminConsoleMode({
                        ...mode,
                        selectedOption: IceCreamInventoryMenuOption.GoBack
                    })
                }
                onClick={() =>
                    props.emulatorState.setAdminConsoleMode({
                        ...mode,
                        screen: AdminConsoleScreen.Main,
                        selectedOption: MainMenuOption.IceCreamInventory,
                        inventoryData: undefined
                    })
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
                use arrow keys to navigate, enter to select, escape to go back
            </Typography>
        </Box>
    );
};

export default IceCreamInventoryMenu;
