import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";

import {
    IceCreamInventoryMenuOption,
    type AdminConsoleMode,
    AdminConsoleScreen
} from "../../../../javascript-terminal/emulator-state/EmulatorState";
import { useAppContext } from "../../../AppContext";
import type { TerminalTheme } from "../../Terminal";
import MenuItem from "../common/MenuItem";
import { ConsoleHeading, ConsoleHint } from "../common/ConsoleText";
import useLoadingDots from "../common/useLoadingDots";
import Stepper from "../common/Stepper";

type EditField = "name" | "color" | "type" | "count";

type IceCreamInventoryMenuProps = {
    theme: TerminalTheme;
    onAction: (key: string) => void;
    mode: AdminConsoleMode<AdminConsoleScreen.IceCreamInventory>;
};

const IceCreamInventoryMenu = (props: IceCreamInventoryMenuProps) => {
    const { emulatorState } = useAppContext();
    const muiTheme = useTheme();
    const smallScreen = useMediaQuery(muiTheme.breakpoints.down("md"));
    const dots = useLoadingDots();

    const selectOption = (option: IceCreamInventoryMenuOption) => {
        emulatorState.setAdminConsoleMode({ ...props.mode, selectedOption: option });
        props.onAction("Enter");
    };

    const selectField = (field: EditField) => {
        emulatorState.setAdminConsoleMode({ ...props.mode, editingField: field });
        props.onAction("");
    };

    const flavor = props.mode.editingFlavor;
    if (flavor) {
        return (
            <Box sx={{ paddingTop: 1 }}>
                <ConsoleHeading theme={props.theme} title={"Modify Flavor Inventory"} />
                <Box sx={{ opacity: props.mode.loading ? 0.4 : 1 }}>
                    {(["name", "color", "type", "count"] as const).map((field) => {
                        const active = (props.mode.editingField || "name") === field;
                        let value: string;
                        if (field === "type") value = flavor.type || "Not Listed";
                        else if (field === "count") value = String(flavor.count);
                        else value = flavor[field] || "_";
                        const stepper = field === "type" || field === "count";
                        return (
                            <Typography
                                key={field}
                                onClick={
                                    smallScreen && !props.mode.loading
                                        ? () => {
                                              selectField(field);
                                          }
                                        : undefined
                                }
                                sx={{
                                    color: active
                                        ? props.theme.commandColor
                                        : props.theme.outputColor,
                                    backgroundColor: active
                                        ? "rgba(255,255,255,0.1)"
                                        : "transparent",
                                    padding: "4px 8px",
                                    mb: field === "count" ? 2 : 1,
                                    cursor: smallScreen ? "pointer" : undefined
                                }}
                            >
                                {active ? "> " : "  "}
                                {field.charAt(0).toUpperCase() + field.slice(1)}:{" "}
                                {active && stepper && smallScreen ? (
                                    <Stepper
                                        value={value}
                                        width={field === "count" ? "4ch" : "13ch"}
                                        theme={props.theme}
                                        onStep={(key) => {
                                            props.onAction(key);
                                        }}
                                    />
                                ) : (
                                    <>
                                        {value}
                                        {active && stepper ? " (←/→ to change)" : ""}
                                    </>
                                )}
                            </Typography>
                        );
                    })}
                </Box>
                {smallScreen && !props.mode.loading && (
                    <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                        <MenuItem
                            selected={false}
                            theme={props.theme}
                            onClick={() => {
                                props.onAction("Enter");
                            }}
                        >
                            Save
                        </MenuItem>
                        <MenuItem
                            selected={false}
                            theme={props.theme}
                            onClick={() => {
                                props.onAction("Escape");
                            }}
                        >
                            Cancel
                        </MenuItem>
                    </Box>
                )}
                <ConsoleHint theme={props.theme}>
                    {props.mode.loading
                        ? `Loading${dots}`
                        : smallScreen
                          ? "tap a field to edit, then Save"
                          : "up/down: select field | type: edit | left/right: change value | enter: save | escape: cancel"}
                </ConsoleHint>
            </Box>
        );
    }

    return (
        <Box sx={{ paddingTop: 1 }}>
            <ConsoleHeading theme={props.theme} title={"Ice Cream Inventory"} />
            <MenuItem
                selected={
                    props.mode.selectedOption === IceCreamInventoryMenuOption.ProvisionNewFlavor
                }
                theme={props.theme}
                onClick={
                    smallScreen
                        ? () => {
                              selectOption(IceCreamInventoryMenuOption.ProvisionNewFlavor);
                          }
                        : undefined
                }
            >
                1. Provision New Flavor
            </MenuItem>
            <MenuItem
                selected={
                    props.mode.selectedOption === IceCreamInventoryMenuOption.ModifyFlavorInventory
                }
                theme={props.theme}
                onClick={
                    smallScreen
                        ? () => {
                              selectOption(IceCreamInventoryMenuOption.ModifyFlavorInventory);
                          }
                        : undefined
                }
            >
                2. Modify Flavor Inventory
            </MenuItem>
            <MenuItem
                selected={props.mode.selectedOption === IceCreamInventoryMenuOption.GoBack}
                theme={props.theme}
                onClick={
                    smallScreen
                        ? () => {
                              selectOption(IceCreamInventoryMenuOption.GoBack);
                          }
                        : undefined
                }
            >
                3. Go Back
            </MenuItem>
            <ConsoleHint theme={props.theme} spaced>
                {smallScreen
                    ? "tap an option to select"
                    : "use arrow keys to navigate, enter to select, escape to go back"}
            </ConsoleHint>
        </Box>
    );
};

export default IceCreamInventoryMenu;
