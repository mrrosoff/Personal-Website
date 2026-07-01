import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useMemo, useState, useEffect } from "react";

import { sortInventory } from "../../../javascript-terminal/commands/console";
import type { AdminConsoleState } from "../../../javascript-terminal/emulator-state/EmulatorState";
import { useAppContext } from "../../AppContext";
import type { TerminalTheme } from "../Terminal";
import MenuItem from "./common/MenuItem";

const SelectFlavorMenu = (props: { theme?: TerminalTheme; onAction: (key: string) => void }) => {
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

    const ITEMS_PER_PAGE = 4;
    const selectedIndex = mode.selectedOption as number;
    const currentPage = mode.currentPage ?? 0;

    const sortedInventory = useMemo(() => {
        return sortInventory(mode.inventoryData ?? []);
    }, [mode.inventoryData]);

    const { totalPages, startIndex, itemsOnPage } = useMemo(() => {
        const totalPages = Math.ceil(sortedInventory.length / ITEMS_PER_PAGE);
        const startIndex = currentPage * ITEMS_PER_PAGE;
        const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, sortedInventory.length);
        const itemsOnPage = sortedInventory.slice(startIndex, endIndex);
        return { totalPages, startIndex, itemsOnPage };
    }, [sortedInventory, currentPage]);

    const select = (globalIndex: number) => {
        emulatorState.setAdminConsoleMode({ ...mode, selectedOption: globalIndex });
        props.onAction("Enter");
    };
    const goToPage = (page: number) => {
        emulatorState.setAdminConsoleMode({
            ...mode,
            currentPage: page,
            selectedOption: page * ITEMS_PER_PAGE
        });
        props.onAction("");
    };

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
                <Typography
                    sx={{
                        color: props.theme?.outputColor || "#FCFCFC",
                        fontSize: "0.9em",
                        opacity: 0.7
                    }}
                >
                    Loading{dots}
                </Typography>
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
                        onClick={smallScreen ? () => select(globalIndex) : undefined}
                    >
                        {globalIndex + 1}. {item.name} ({item.count} pints)
                    </MenuItem>
                );
            })}
            {smallScreen && (
                <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                    {totalPages > 1 && (
                        <>
                            <MenuItem
                                selected={false}
                                theme={props.theme}
                                disabled={currentPage === 0}
                                onClick={() => goToPage(currentPage - 1)}
                            >
                                ‹ Prev
                            </MenuItem>
                            <MenuItem
                                selected={false}
                                theme={props.theme}
                                disabled={currentPage >= totalPages - 1}
                                onClick={() => goToPage(currentPage + 1)}
                            >
                                Next ›
                            </MenuItem>
                        </>
                    )}
                    <MenuItem
                        selected={false}
                        theme={props.theme}
                        onClick={() => props.onAction("Escape")}
                    >
                        Go Back
                    </MenuItem>
                </Box>
            )}
            <Typography
                sx={{
                    color: props.theme?.outputColor || "#FCFCFC",
                    mt: 1,
                    fontSize: "0.9em",
                    opacity: 0.7
                }}
            >
                Page {currentPage + 1} of {totalPages}.{" "}
                {smallScreen
                    ? "tap a flavor to edit"
                    : "use arrow keys to navigate, enter to select, escape to go back"}
            </Typography>
        </Box>
    );
};

export default SelectFlavorMenu;
