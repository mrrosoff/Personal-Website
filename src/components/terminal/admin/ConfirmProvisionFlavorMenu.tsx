import { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography } from "@mui/material";

import EmulatorState, {
    AdminConsoleState,
    AdminConsoleScreen,
    IceCreamInventoryMenuOption
} from "../../../javascript-terminal/emulator-state/EmulatorState";
import { TerminalTheme } from "../Terminal";
import MenuItem from "./common/MenuItem";

const ConfirmProvisionFlavorMenu = (props: {
    theme?: TerminalTheme;
    emulatorState: EmulatorState;
}) => {
    const mode = props.emulatorState.getAdminConsoleMode() as AdminConsoleState;
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

    const provisionFlavor = async () => {
        const authToken = props.emulatorState.getEnvVariables()["AUTH_TOKEN"];
        try {
            await axios.post(
                "https://api.maxrosoff.com/admin/provision-flavor",
                {
                    flavorName: form.flavorName,
                    initialQuantity: form.initialQuantity,
                    color: form.color,
                    type: form.type
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` }
                }
            );
        } catch (err) {
            console.error("Failed to provision flavor", err);
        }
    };

    const handleYesClick = async () => {
        props.emulatorState.setAdminConsoleMode({ ...mode, loading: true });
        try {
            await provisionFlavor();
            props.emulatorState.setAdminConsoleMode({
                ...mode,
                screen: AdminConsoleScreen.IceCreamInventory,
                selectedOption: IceCreamInventoryMenuOption.ProvisionNewFlavor,
                provisionForm: undefined,
                loading: false
            });
        } catch {
            props.emulatorState.setAdminConsoleMode({ ...mode, loading: false });
        }
    };

    const handleNoClick = () => {
        props.emulatorState.setAdminConsoleMode({
            ...mode,
            screen: AdminConsoleScreen.ProvisionFlavorForm,
            selectedOption: 0
        });
    };

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
                    onMouseEnter={() =>
                        props.emulatorState.setAdminConsoleMode({
                            ...mode,
                            selectedOption: "yes"
                        })
                    }
                    onClick={handleYesClick}
                >
                    Yes
                </MenuItem>
                <MenuItem
                    selected={selectedOption === "no"}
                    theme={props.theme}
                    disabled={mode.loading}
                    onMouseEnter={() =>
                        props.emulatorState.setAdminConsoleMode({
                            ...mode,
                            selectedOption: "no"
                        })
                    }
                    onClick={handleNoClick}
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
