import axios from "axios";
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
                <Typography sx={{ color: props.theme?.outputColor || "#FCFCFC", mb: 1 }}>
                    Editing: {mode.editingFlavor.name}
                </Typography>
                <Typography
                    sx={{
                        color: props.theme?.commandColor || "#FFFFFF",
                        mb: 1
                    }}
                >
                    Type: {mode.editingFlavor.type || "Not Listed"}
                </Typography>
                <Typography
                    sx={{
                        color: props.theme?.commandColor || "#FFFFFF",
                        mb: 2
                    }}
                >
                    Count: {mode.editingFlavor.count}
                </Typography>
                <Typography
                    sx={{
                        color: props.theme?.outputColor || "#FCFCFC",
                        fontSize: "0.9em",
                        opacity: 0.7
                    }}
                >
                    left/right: change type | up/down: adjust count | enter: save | escape: cancel
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
                selected={
                    mode.selectedOption === IceCreamInventoryMenuOption.ProvisionNewFlavor
                }
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
                selected={
                    mode.selectedOption === IceCreamInventoryMenuOption.ModifyFlavorInventory
                }
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
