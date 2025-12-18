import { Box, Typography } from "@mui/material";
import axios from "axios";

import EmulatorState, {
    AdminConsoleState,
    AdminConsoleScreen,
    MainMenuOption,
    IceCreamInventoryMenuOption
} from "../../../javascript-terminal/emulator-state/EmulatorState";
import { TerminalTheme } from "../Terminal";
import { DatabaseFlavor } from "../../../../api/types";

const AdminConsole = (props: { emulatorState: EmulatorState; theme?: TerminalTheme }) => {
    const mode = props.emulatorState.getAdminConsoleMode();
    if (!mode || !mode.screen) return null;

    switch (mode.screen) {
        case AdminConsoleScreen.Main:
            return <MainMenu mode={mode} theme={props.theme} emulatorState={props.emulatorState} />;
        case AdminConsoleScreen.IceCreamInventory:
            return (
                <IceCreamInventoryMenu
                    mode={mode}
                    theme={props.theme}
                    emulatorState={props.emulatorState}
                />
            );
        case AdminConsoleScreen.SelectFlavor:
            return (
                <SelectFlavorMenu
                    mode={mode}
                    theme={props.theme}
                    emulatorState={props.emulatorState}
                />
            );
        case AdminConsoleScreen.ConfirmSendEmails:
            return (
                <ConfirmSendEmailsMenu
                    mode={mode}
                    theme={props.theme}
                    emulatorState={props.emulatorState}
                />
            );
        case AdminConsoleScreen.ProvisionFlavorForm:
            return (
                <ProvisionFlavorFormMenu
                    mode={mode}
                    theme={props.theme}
                    emulatorState={props.emulatorState}
                />
            );
        case AdminConsoleScreen.ConfirmProvisionFlavor:
            return (
                <ConfirmProvisionFlavorMenu
                    mode={mode}
                    theme={props.theme}
                    emulatorState={props.emulatorState}
                />
            );
    }
};

const MainMenu = (props: {
    mode: AdminConsoleState;
    theme?: TerminalTheme;
    emulatorState: EmulatorState;
}) => (
    <Box sx={{ paddingTop: 1 }}>
        <Typography
            style={{
                color: props.theme?.outputColor || "#FCFCFC",
                fontWeight: "bold",
                marginBottom: 10
            }}
        >
            === Admin Console ===
        </Typography>
        <MenuItem
            selected={props.mode.selectedOption === MainMenuOption.IceCreamInventory}
            theme={props.theme}
            onMouseEnter={() =>
                props.emulatorState.setAdminConsoleMode({
                    ...props.mode,
                    selectedOption: MainMenuOption.IceCreamInventory
                })
            }
            onClick={() =>
                props.emulatorState.setAdminConsoleMode({
                    ...props.mode,
                    screen: AdminConsoleScreen.IceCreamInventory,
                    selectedOption: IceCreamInventoryMenuOption.ProvisionNewFlavor
                })
            }
        >
            1. Ice Cream Inventory
        </MenuItem>
        <MenuItem
            selected={props.mode.selectedOption === MainMenuOption.SendMarketingEmails}
            theme={props.theme}
            onMouseEnter={() =>
                props.emulatorState.setAdminConsoleMode({
                    ...props.mode,
                    selectedOption: MainMenuOption.SendMarketingEmails
                })
            }
            onClick={() =>
                props.emulatorState.setAdminConsoleMode({
                    ...props.mode,
                    screen: AdminConsoleScreen.ConfirmSendEmails,
                    selectedOption: "yes"
                })
            }
        >
            2. Send Marketing Emails
        </MenuItem>
        <MenuItem
            selected={props.mode.selectedOption === MainMenuOption.Exit}
            theme={props.theme}
            onMouseEnter={() =>
                props.emulatorState.setAdminConsoleMode({
                    ...props.mode,
                    selectedOption: MainMenuOption.Exit
                })
            }
            onClick={() => props.emulatorState.setAdminConsoleMode(undefined)}
        >
            3. Exit
        </MenuItem>
        <Typography
            style={{
                color: props.theme?.outputColor || "#FCFCFC",
                marginTop: 16,
                fontSize: "0.9em",
                opacity: 0.7
            }}
        >
            use arrow keys to navigate, enter to select, escape to exit
        </Typography>
    </Box>
);

const IceCreamInventoryMenu = (props: {
    mode: AdminConsoleState;
    theme?: TerminalTheme;
    emulatorState: EmulatorState;
}) => {
    const provisionNewFlavor = () => {
        props.emulatorState.setAdminConsoleMode({
            ...props.mode,
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
            ...props.mode,
            screen: AdminConsoleScreen.SelectFlavor,
            selectedOption: 0
        };
        props.emulatorState.setAdminConsoleMode(newMode);

        const { data } = await axios.post<{ inventory: DatabaseFlavor[] }>(
            "https://api.maxrosoff.com/inventory",
            {
                password: props.mode.password
            }
        );
        props.emulatorState.setAdminConsoleMode({ ...newMode, inventoryData: data.inventory });
    };

    if (props.mode.editingFlavor) {
        return (
            <Box sx={{ paddingTop: 1 }}>
                <Typography
                    style={{
                        color: props.theme?.outputColor || "#FCFCFC",
                        fontWeight: "bold",
                        marginBottom: 10
                    }}
                >
                    === Admin Console (Modify Flavor Inventory) ===
                </Typography>
                <Typography
                    style={{ color: props.theme?.outputColor || "#FCFCFC", marginBottom: 8 }}
                >
                    Editing: {props.mode.editingFlavor.name}
                </Typography>
                <Typography
                    style={{
                        color: props.theme?.commandColor || "#FFFFFF",
                        marginBottom: 8
                    }}
                >
                    Type: {props.mode.editingFlavor.type || "Not Listed"}
                </Typography>
                <Typography
                    style={{
                        color: props.theme?.commandColor || "#FFFFFF",
                        marginBottom: 16
                    }}
                >
                    Count: {props.mode.editingFlavor.count}
                </Typography>
                <Typography
                    style={{
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
                style={{
                    color: props.theme?.outputColor || "#FCFCFC",
                    fontWeight: "bold",
                    marginBottom: 10
                }}
            >
                === Admin Console (Ice Cream Inventory) ===
            </Typography>
            {props.mode.inventoryData && props.mode.inventoryData.length > 0 && (
                <Box sx={{ marginBottom: 16, paddingLeft: 2 }}>
                    <Typography
                        style={{
                            color: props.theme?.outputColor || "#FCFCFC",
                            marginBottom: 4,
                            fontSize: "0.9em"
                        }}
                    >
                        Current Inventory:
                    </Typography>
                    {props.mode.inventoryData.map((item) => (
                        <Typography
                            key={item.priceId}
                            style={{
                                color: props.theme?.outputColor || "#FCFCFC",
                                fontSize: "0.85em",
                                paddingLeft: 8
                            }}
                        >
                            - {item.name}: {item.count} pints
                        </Typography>
                    ))}
                </Box>
            )}

            <MenuItem
                selected={
                    props.mode.selectedOption === IceCreamInventoryMenuOption.ProvisionNewFlavor
                }
                theme={props.theme}
                onMouseEnter={() =>
                    props.emulatorState.setAdminConsoleMode({
                        ...props.mode,
                        selectedOption: IceCreamInventoryMenuOption.ProvisionNewFlavor
                    })
                }
                onClick={provisionNewFlavor}
            >
                1. Provision New Flavor
            </MenuItem>
            <MenuItem
                selected={
                    props.mode.selectedOption === IceCreamInventoryMenuOption.ModifyFlavorInventory
                }
                theme={props.theme}
                onMouseEnter={() =>
                    props.emulatorState.setAdminConsoleMode({
                        ...props.mode,
                        selectedOption: IceCreamInventoryMenuOption.ModifyFlavorInventory
                    })
                }
                onClick={handleModifyInventory}
            >
                2. Modify Flavor Inventory
            </MenuItem>
            <MenuItem
                selected={props.mode.selectedOption === IceCreamInventoryMenuOption.GoBack}
                theme={props.theme}
                onMouseEnter={() =>
                    props.emulatorState.setAdminConsoleMode({
                        ...props.mode,
                        selectedOption: IceCreamInventoryMenuOption.GoBack
                    })
                }
                onClick={() =>
                    props.emulatorState.setAdminConsoleMode({
                        ...props.mode,
                        screen: AdminConsoleScreen.Main,
                        selectedOption: MainMenuOption.IceCreamInventory,
                        inventoryData: undefined
                    })
                }
            >
                3. Go Back
            </MenuItem>
            <Typography
                style={{
                    color: props.theme?.outputColor || "#FCFCFC",
                    marginTop: 16,
                    fontSize: "0.9em",
                    opacity: 0.7
                }}
            >
                use arrow keys to navigate, enter to select, escape to go back
            </Typography>
        </Box>
    );
};

const SelectFlavorMenu = (props: {
    mode: AdminConsoleState;
    theme?: TerminalTheme;
    emulatorState: EmulatorState;
}) => {
    const ITEMS_PER_PAGE = 5;
    const selectedIndex = props.mode.selectedOption as number;
    const currentPage = props.mode.currentPage ?? 0;

    if (!props.mode.inventoryData) {
        return (
            <Box sx={{ paddingTop: 1 }}>
                <Typography
                    style={{
                        color: props.theme?.outputColor || "#FCFCFC",
                        fontWeight: "bold",
                        marginBottom: 10
                    }}
                >
                    === Admin Console (Select Flavor) ===
                </Typography>
                <Typography
                    style={{ color: props.theme?.outputColor || "#FCFCFC", marginBottom: 16 }}
                >
                    Loading inventory...
                </Typography>
            </Box>
        );
    }

    if (props.mode.inventoryData.length === 0) {
        return (
            <Box sx={{ paddingTop: 1 }}>
                <Typography
                    style={{
                        color: props.theme?.outputColor || "#FCFCFC",
                        fontWeight: "bold",
                        marginBottom: 10
                    }}
                >
                    === Admin Console (Select Flavor) ===
                </Typography>
                <Typography
                    style={{ color: props.theme?.outputColor || "#FCFCFC", marginBottom: 16 }}
                >
                    No flavors available
                </Typography>
            </Box>
        );
    }

    const allItems = props.mode.inventoryData;
    const totalPages = Math.ceil(allItems.length / ITEMS_PER_PAGE);
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, allItems.length);
    const itemsOnPage = allItems.slice(startIndex, endIndex);

    return (
        <Box sx={{ paddingTop: 1 }}>
            <Typography
                style={{
                    color: props.theme?.outputColor || "#FCFCFC",
                    fontWeight: "bold",
                    marginBottom: 10
                }}
            >
                === Admin Console (Select Flavor) ===
            </Typography>
            {itemsOnPage.map((item, pageIndex) => {
                const globalIndex = startIndex + pageIndex;

                return (
                    <MenuItem
                        key={item.productId}
                        selected={selectedIndex === globalIndex}
                        theme={props.theme}
                        onMouseEnter={() =>
                            props.emulatorState.setAdminConsoleMode({
                                ...props.mode,
                                selectedOption: globalIndex
                            })
                        }
                        onClick={() =>
                            props.emulatorState.setAdminConsoleMode({
                                ...props.mode,
                                screen: AdminConsoleScreen.IceCreamInventory,
                                editingFlavor: item,
                                inventoryData: undefined,
                                currentPage: 0
                            })
                        }
                    >
                        {globalIndex + 1}. {item.name} ({item.count} pints)
                    </MenuItem>
                );
            })}
            <Typography
                style={{
                    color: props.theme?.outputColor || "#FCFCFC",
                    marginTop: 16,
                    fontSize: "0.9em"
                }}
            >
                Page {currentPage + 1} of {totalPages} | Use ← → to navigate pages
            </Typography>
            <Typography
                style={{
                    color: props.theme?.outputColor || "#FCFCFC",
                    marginTop: 16,
                    fontSize: "0.9em",
                    opacity: 0.7
                }}
            >
                use arrow keys to navigate, enter to select, escape to go back
            </Typography>
        </Box>
    );
};

const ConfirmSendEmailsMenu = (props: {
    mode: AdminConsoleState;
    theme?: TerminalTheme;
    emulatorState: EmulatorState;
}) => {
    const selectedOption = props.mode.selectedOption as "yes" | "no";

    const sendMarketingEmails = async () => {
        try {
            await axios.post("https://api.maxrosoff.com/admin/send-marketing-emails", {
                password: props.mode.password
            });
        } catch (err) {
            console.error("Failed to send marketing emails", err);
        }
    };

    const handleYesClick = async () => {
        await sendMarketingEmails();
        props.emulatorState.setAdminConsoleMode({
            ...props.mode,
            screen: AdminConsoleScreen.Main,
            selectedOption: MainMenuOption.SendMarketingEmails
        });
    };

    const handleNoClick = () => {
        props.emulatorState.setAdminConsoleMode({
            ...props.mode,
            screen: AdminConsoleScreen.Main,
            selectedOption: MainMenuOption.SendMarketingEmails
        });
    };

    return (
        <Box sx={{ paddingTop: 1 }}>
            <Typography
                style={{
                    color: props.theme?.outputColor || "#FCFCFC",
                    fontWeight: "bold",
                    marginBottom: 10
                }}
            >
                === Admin Console (Send Marketing Emails) ===
            </Typography>
            <Typography
                style={{
                    color: props.theme?.outputColor || "#FCFCFC",
                    marginBottom: 16
                }}
            >
                Are you sure you want to send marketing emails to all subscribers?
            </Typography>
            <Box sx={{ display: "flex", gap: 2, marginBottom: 16 }}>
                <MenuItem
                    selected={selectedOption === "yes"}
                    theme={props.theme}
                    onMouseEnter={() =>
                        props.emulatorState.setAdminConsoleMode({
                            ...props.mode,
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
                    onMouseEnter={() =>
                        props.emulatorState.setAdminConsoleMode({
                            ...props.mode,
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
                left/right: select option | enter: confirm | escape: cancel
            </Typography>
        </Box>
    );
};

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
                style={{
                    color: props.theme?.outputColor || "#FCFCFC",
                    fontWeight: "bold",
                    marginBottom: 10
                }}
            >
                === Admin Console (Provision New Flavor) ===
            </Typography>

            <Box sx={{ marginBottom: 16 }}>
                <Typography
                    style={{
                        color:
                            form.currentField === "flavorName"
                                ? props.theme?.commandColor || "#FFFFFF"
                                : props.theme?.outputColor || "#FCFCFC",
                        backgroundColor:
                            form.currentField === "flavorName"
                                ? "rgba(255,255,255,0.1)"
                                : "transparent",
                        padding: "4px 8px",
                        marginBottom: 8
                    }}
                >
                    {form.currentField === "flavorName" ? "> " : "  "}Flavor Name:{" "}
                    {form.flavorName || "_"}
                </Typography>

                <Typography
                    style={{
                        color:
                            form.currentField === "initialQuantity"
                                ? props.theme?.commandColor || "#FFFFFF"
                                : props.theme?.outputColor || "#FCFCFC",
                        backgroundColor:
                            form.currentField === "initialQuantity"
                                ? "rgba(255,255,255,0.1)"
                                : "transparent",
                        padding: "4px 8px",
                        marginBottom: 8
                    }}
                >
                    {form.currentField === "initialQuantity" ? "> " : "  "}Initial Quantity:{" "}
                    {form.initialQuantity}
                </Typography>

                <Typography
                    style={{
                        color:
                            form.currentField === "color"
                                ? props.theme?.commandColor || "#FFFFFF"
                                : props.theme?.outputColor || "#FCFCFC",
                        backgroundColor:
                            form.currentField === "color" ? "rgba(255,255,255,0.1)" : "transparent",
                        padding: "4px 8px",
                        marginBottom: 8
                    }}
                >
                    {form.currentField === "color" ? "> " : "  "}Color: {form.color || "_"}
                </Typography>

                <Typography
                    style={{
                        color:
                            form.currentField === "type"
                                ? props.theme?.commandColor || "#FFFFFF"
                                : props.theme?.outputColor || "#FCFCFC",
                        backgroundColor:
                            form.currentField === "type" ? "rgba(255,255,255,0.1)" : "transparent",
                        padding: "4px 8px",
                        marginBottom: 8
                    }}
                >
                    {form.currentField === "type" ? "> " : "  "}Type: {form.type || "Not Listed"}{" "}
                    {form.currentField === "type" ? "(←/→ to change)" : ""}
                </Typography>
            </Box>

            <Typography
                style={{
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

const ConfirmProvisionFlavorMenu = (props: {
    mode: AdminConsoleState;
    theme?: TerminalTheme;
    emulatorState: EmulatorState;
}) => {
    const selectedOption = props.mode.selectedOption as "yes" | "no";
    const form = props.mode.provisionForm;
    if (!form) return null;

    const provisionFlavor = async () => {
        try {
            await axios.post("https://api.maxrosoff.com/admin/provision-flavor", {
                flavorName: form.flavorName,
                initialQuantity: form.initialQuantity,
                color: form.color,
                type: form.type,
                password: props.mode.password
            });
        } catch (err) {
            console.error("Failed to provision flavor", err);
        }
    };

    const handleYesClick = async () => {
        await provisionFlavor();
        props.emulatorState.setAdminConsoleMode({
            ...props.mode,
            screen: AdminConsoleScreen.IceCreamInventory,
            selectedOption: IceCreamInventoryMenuOption.ProvisionNewFlavor,
            provisionForm: undefined
        });
    };

    const handleNoClick = () => {
        props.emulatorState.setAdminConsoleMode({
            ...props.mode,
            screen: AdminConsoleScreen.ProvisionFlavorForm,
            selectedOption: 0
        });
    };

    return (
        <Box sx={{ paddingTop: 1 }}>
            <Typography
                style={{
                    color: props.theme?.outputColor || "#FCFCFC",
                    fontWeight: "bold",
                    marginBottom: 10
                }}
            >
                === Admin Console (Confirm Provision Flavor) ===
            </Typography>
            <Typography
                style={{
                    color: props.theme?.outputColor || "#FCFCFC",
                    marginBottom: 8
                }}
            >
                Please confirm the following details:
            </Typography>
            <Box sx={{ marginBottom: 16, paddingLeft: 2 }}>
                <Typography
                    style={{ color: props.theme?.outputColor || "#FCFCFC", fontSize: "0.9em" }}
                >
                    Flavor Name: {form.flavorName}
                </Typography>
                <Typography
                    style={{ color: props.theme?.outputColor || "#FCFCFC", fontSize: "0.9em" }}
                >
                    Initial Quantity: {form.initialQuantity}
                </Typography>
                <Typography
                    style={{ color: props.theme?.outputColor || "#FCFCFC", fontSize: "0.9em" }}
                >
                    Color: {form.color}
                </Typography>
                <Typography
                    style={{ color: props.theme?.outputColor || "#FCFCFC", fontSize: "0.9em" }}
                >
                    Type: {form.type || "Not Listed"}
                </Typography>
            </Box>
            <Typography
                style={{
                    color: props.theme?.outputColor || "#FCFCFC",
                    marginBottom: 16
                }}
            >
                Provision this flavor?
            </Typography>
            <Box sx={{ display: "flex", gap: 2, marginBottom: 16 }}>
                <MenuItem
                    selected={selectedOption === "yes"}
                    theme={props.theme}
                    onMouseEnter={() =>
                        props.emulatorState.setAdminConsoleMode({
                            ...props.mode,
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
                    onMouseEnter={() =>
                        props.emulatorState.setAdminConsoleMode({
                            ...props.mode,
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
                left/right: select option | enter: confirm | escape: cancel
            </Typography>
        </Box>
    );
};

const MenuItem = (props: {
    selected: boolean;
    theme?: TerminalTheme;
    children: React.ReactNode;
    onClick?: () => void;
    onMouseEnter?: () => void;
}) => (
    <Typography
        onClick={props.onClick}
        onMouseEnter={props.onMouseEnter}
        style={{
            color: props.selected
                ? props.theme?.commandColor || "#FFFFFF"
                : props.theme?.outputColor || "#FCFCFC",
            backgroundColor: props.selected ? "rgba(255,255,255,0.1)" : "transparent",
            padding: "4px 8px",
            marginBottom: 4,
            cursor: props.onClick ? "pointer" : "default",
            userSelect: "none"
        }}
    >
        {props.selected ? "> " : "  "}
        {props.children}
    </Typography>
);

export default AdminConsole;
