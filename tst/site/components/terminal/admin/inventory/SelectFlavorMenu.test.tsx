import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { mockSmallScreen, mockTerminalTheme, renderWithApp } from "../../../../../helpers/render";
import { mockAdminState } from "../../../../../helpers/terminal";
import { mockFlavor } from "../../../../../fixtures/aws/dynamodb";

import SelectFlavorMenu from "../../../../../../site/components/terminal/admin/inventory/SelectFlavorMenu";
import {
    AdminConsoleScreen,
    type AdminConsoleMode
} from "../../../../../../site/javascript-terminal/emulator-state/EmulatorState";

const inventory = ["a", "b", "c", "d", "e"].map((name, i) => ({
    ...mockFlavor,
    productId: name,
    name,
    count: 10 - i
}));

function renderMenu(mode: Partial<AdminConsoleMode<AdminConsoleScreen.SelectFlavor>> = {}) {
    const onAction = vi.fn();
    const consoleMode: AdminConsoleMode<AdminConsoleScreen.SelectFlavor> = {
        screen: AdminConsoleScreen.SelectFlavor,
        inventoryData: inventory,
        selectedOption: 0,
        ...mode
    };
    const emulatorState = mockAdminState(consoleMode);
    const result = renderWithApp(
        <SelectFlavorMenu theme={mockTerminalTheme} onAction={onAction} mode={consoleMode} />,
        {
            emulatorState
        }
    );
    return { ...result, onAction, emulatorState };
}

describe("SelectFlavorMenu", () => {
    it("should say it is loading", () => {
        renderMenu({ inventoryData: undefined });

        expect(screen.getByText(/^Loading/)).toBeInTheDocument();
    });

    it("should say when there are no flavors", () => {
        renderMenu({ inventoryData: [] });

        expect(screen.getByText("No flavors available")).toBeInTheDocument();
    });

    it("should list a page of flavors", () => {
        renderMenu();

        expect(screen.getByText(/1\. a/)).toHaveTextContent("> 1. a (10 pints)");
        expect(screen.queryByText(/5\. e/)).not.toBeInTheDocument();
        expect(screen.getByText(/Page 1 of 2/)).toHaveTextContent("use arrow keys");
    });

    it("should start on the first page by default", () => {
        renderMenu({ currentPage: undefined, selectedOption: 4 });

        expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
    });

    it("should pick a flavor with a tap on a small screen", async () => {
        mockSmallScreen();
        const { user, onAction, emulatorState } = renderMenu();

        await user.click(screen.getByText(/3\. c/));

        expect(emulatorState.getAdminConsoleMode()?.selectedOption).toBe(2);
        expect(onAction).toHaveBeenCalledWith("Enter");
        expect(screen.getByText(/tap a flavor to edit/)).toBeInTheDocument();
    });

    it("should turn to the next page with a tap", async () => {
        mockSmallScreen();
        const { user, emulatorState } = renderMenu();

        await user.click(screen.getByText(/Next/));

        expect(emulatorState.getAdminConsoleMode()).toMatchObject({
            currentPage: 1,
            selectedOption: 4
        });
    });

    it("should turn back a page with a tap", async () => {
        mockSmallScreen();
        const { user, emulatorState } = renderMenu({ currentPage: 1, selectedOption: 4 });

        await user.click(screen.getByText(/Prev/));

        expect(emulatorState.getAdminConsoleMode()).toMatchObject({
            currentPage: 0,
            selectedOption: 0
        });
    });

    it("should hide paging for a single page", () => {
        mockSmallScreen();
        renderMenu({ inventoryData: inventory.slice(0, 2) });

        expect(screen.queryByText(/Next/)).not.toBeInTheDocument();
    });

    it("should go back with a tap", async () => {
        mockSmallScreen();
        const { user, onAction } = renderMenu();

        await user.click(screen.getByText(/Go Back/));

        expect(onAction).toHaveBeenCalledWith("Escape");
    });
});
