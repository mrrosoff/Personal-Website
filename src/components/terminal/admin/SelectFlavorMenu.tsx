import { Box, Typography } from "@mui/material";

import EmulatorState, {
    AdminConsoleState,
    AdminConsoleScreen
} from "../../../javascript-terminal/emulator-state/EmulatorState";
import { TerminalTheme } from "../Terminal";
import MenuItem from "./common/MenuItem";
import LoadingDots from "./common/LoadingDots";

const SelectFlavorMenu = (props: {
    mode: AdminConsoleState;
    theme?: TerminalTheme;
    emulatorState: EmulatorState;
}) => {
    const ITEMS_PER_PAGE = 4;
    const selectedIndex = props.mode.selectedOption as number;
    const currentPage = props.mode.currentPage ?? 0;

    if (!props.mode.inventoryData) {
        return (
            <Box sx={{ paddingTop: 1 }}>
                <Typography
                    sx={{
                        color: props.theme?.outputColor || "#FCFCFC",
                        fontWeight: "bold",
                        mb: 1.25
                    }}
                >
                    === Admin Console (Select Flavor) ===
                </Typography>
                <LoadingDots theme={props.theme} />
            </Box>
        );
    }

    if (props.mode.inventoryData.length === 0) {
        return (
            <Box sx={{ paddingTop: 1 }}>
                <Typography
                    sx={{
                        color: props.theme?.outputColor || "#FCFCFC",
                        fontWeight: "bold",
                        mb: 1.25
                    }}
                >
                    === Admin Console (Select Flavor) ===
                </Typography>
                <Typography sx={{ color: props.theme?.outputColor || "#FCFCFC", mb: 2 }}>
                    No flavors available
                </Typography>
            </Box>
        );
    }

    // Sort inventory: current → last-batch → upcoming, then by count (descending)
    const typeOrder = { current: 0, "last-batch": 1, upcoming: 2 };
    const sortedInventory = [...props.mode.inventoryData].sort((a, b) => {
        const typeA = typeOrder[a.type as keyof typeof typeOrder] ?? 999;
        const typeB = typeOrder[b.type as keyof typeof typeOrder] ?? 999;

        if (typeA !== typeB) {
            return typeA - typeB;
        }

        return b.count - a.count; // Descending count
    });

    const allItems = sortedInventory;
    const totalPages = Math.ceil(allItems.length / ITEMS_PER_PAGE);
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, allItems.length);
    const itemsOnPage = allItems.slice(startIndex, endIndex);

    return (
        <Box sx={{ paddingTop: 1 }}>
            <Typography
                sx={{
                    color: props.theme?.outputColor || "#FCFCFC",
                    fontWeight: "bold",
                    mb: 1.25
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
                sx={{
                    color: props.theme?.outputColor || "#FCFCFC",
                    mt: 1,
                    fontSize: "0.9em",
                    opacity: 0.7
                }}
            >
                Page {currentPage + 1} of {totalPages}. use arrow keys to navigate, enter to select,
                escape to go back
            </Typography>
        </Box>
    );
};

export default SelectFlavorMenu;
