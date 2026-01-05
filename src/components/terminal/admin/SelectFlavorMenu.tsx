import { Box, Typography } from "@mui/material";
import { useMemo } from "react";

import EmulatorState, {
    AdminConsoleState,
    AdminConsoleScreen
} from "../../../javascript-terminal/emulator-state/EmulatorState";
import { TerminalTheme } from "../Terminal";
import MenuItem from "./common/MenuItem";
import LoadingDots from "./common/LoadingDots";

const SelectFlavorMenu = (props: { theme?: TerminalTheme; emulatorState: EmulatorState }) => {
    const mode = props.emulatorState.getAdminConsoleMode() as AdminConsoleState;

    const ITEMS_PER_PAGE = 4;
    const selectedIndex = mode.selectedOption as number;
    const currentPage = mode.currentPage ?? 0;

    if (!mode.inventoryData) {
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

    if (mode.inventoryData.length === 0) {
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

    const sortedInventory = useMemo(() => {
        const typeOrder = { currentFlavor: 3, lastBatch: 2, upcoming: 1 };
        return [...(mode.inventoryData ?? [])].sort((a, b) => {
            const typeA = typeOrder[a.type as keyof typeof typeOrder] ?? 0;
            const typeB = typeOrder[b.type as keyof typeof typeOrder] ?? 0;

            if (typeA !== typeB) {
                return typeB - typeA;
            }

            return b.count - a.count;
        });
    }, [mode.inventoryData]);

    const { totalPages, startIndex, itemsOnPage } = useMemo(() => {
        const allItems = sortedInventory;
        const totalPages = Math.ceil(allItems.length / ITEMS_PER_PAGE);
        const startIndex = currentPage * ITEMS_PER_PAGE;
        const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, allItems.length);
        const itemsOnPage = allItems.slice(startIndex, endIndex);
        return { totalPages, startIndex, itemsOnPage };
    }, [sortedInventory, currentPage]);

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
                                ...mode,
                                selectedOption: globalIndex
                            })
                        }
                        onClick={() =>
                            props.emulatorState.setAdminConsoleMode({
                                ...mode,
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
