import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { mockSmallScreen, mockTerminalTheme, renderWithApp } from "../../../../../helpers/render";
import { mockAdminState } from "../../../../../helpers/terminal";
import { mockFlavor } from "../../../../../mocks/aws/dynamodb";

import IceCreamInventoryMenu from "../../../../../../site/components/terminal/admin/inventory/IceCreamInventoryMenu";
import {
    AdminConsoleScreen,
    IceCreamInventoryMenuOption
} from "../../../../../../site/javascript-terminal/emulatorState/EmulatorState";
import type { AdminConsoleMode } from "../../../../../../site/javascript-terminal/emulatorState/EmulatorState";

function renderMenu(mode: Partial<AdminConsoleMode<AdminConsoleScreen.IceCreamInventory>> = {}) {
    const onAction = vi.fn();
    const consoleMode: AdminConsoleMode<AdminConsoleScreen.IceCreamInventory> = {
        screen: AdminConsoleScreen.IceCreamInventory,
        selectedOption: IceCreamInventoryMenuOption.ProvisionNewFlavor,
        ...mode
    };
    const emulatorState = mockAdminState(consoleMode);
    const result = renderWithApp(
        <IceCreamInventoryMenu theme={mockTerminalTheme} onAction={onAction} mode={consoleMode} />,
        { emulatorState }
    );
    return { ...result, onAction, emulatorState };
}

describe("IceCreamInventoryMenu", () => {
    it("should list the inventory options", () => {
        renderMenu();

        expect(screen.getByText(/Provision New Flavor/)).toHaveTextContent(
            "> 1. Provision New Flavor"
        );
        expect(screen.getByText(/escape to go back/)).toBeInTheDocument();
    });

    it.each([
        ["1. Provision New Flavor", IceCreamInventoryMenuOption.ProvisionNewFlavor],
        ["2. Modify Flavor Inventory", IceCreamInventoryMenuOption.ModifyFlavorInventory],
        ["3. Go Back", IceCreamInventoryMenuOption.GoBack]
    ])("should choose %s with a tap on a small screen", async (label, option) => {
        mockSmallScreen();
        const { user, onAction, emulatorState } = renderMenu();

        await user.click(screen.getByText(label, { exact: false }));

        expect(emulatorState.getAdminConsoleMode()?.selectedOption).toBe(option);
        expect(onAction).toHaveBeenCalledWith("Enter");
        expect(screen.getByText("tap an option to select")).toBeInTheDocument();
    });
});

describe("editing a flavor", () => {
    it("should show the flavor's fields with the name selected", () => {
        renderMenu({ editingFlavor: mockFlavor });

        expect(screen.getByText(/Name:/)).toHaveTextContent(`> Name: ${mockFlavor.name}`);
        expect(screen.getByText(/Count:/)).toHaveTextContent(
            `Count: ${mockFlavor.count.toString()}`
        );
        expect(screen.getByText(/enter: save/)).toBeInTheDocument();
    });

    it("should show blanks and an unlisted type", () => {
        renderMenu({
            editingFlavor: { ...mockFlavor, name: "", type: null },
            editingField: "type"
        });

        expect(screen.getByText(/Name:/)).toHaveTextContent("Name: _");
        expect(screen.getByText(/Type:/)).toHaveTextContent("> Type: Not Listed (←/→ to change)");
    });

    it("should say when it is saving", () => {
        renderMenu({ editingFlavor: mockFlavor, loading: true });

        expect(screen.getByText(/^Loading/)).toBeInTheDocument();
    });

    it("should pick a field with a tap on a small screen", async () => {
        mockSmallScreen();
        const { user, onAction, emulatorState } = renderMenu({ editingFlavor: mockFlavor });

        await user.click(screen.getByText(/Color:/));

        expect(emulatorState.getAdminConsoleMode()?.editingField).toBe("color");
        expect(onAction).toHaveBeenCalledWith("");
        expect(screen.getByText("tap a field to edit, then Save")).toBeInTheDocument();
    });

    it("should not pick fields while saving", async () => {
        mockSmallScreen();
        const { user, emulatorState } = renderMenu({ editingFlavor: mockFlavor, loading: true });

        await user.click(screen.getByText(/Color:/));

        expect(emulatorState.getAdminConsoleMode()?.editingField).toBeUndefined();
    });

    it.each(["type", "count"] as const)(
        "should step the %s with buttons on a small screen",
        async (editingField) => {
            mockSmallScreen();
            const { user, onAction } = renderMenu({ editingFlavor: mockFlavor, editingField });

            await user.click(screen.getByText("<"));

            expect(onAction).toHaveBeenCalledWith("ArrowLeft");
        }
    );

    it.each([
        ["Save", "Enter"],
        ["Cancel", "Escape"]
    ])("should %s with a tap on a small screen", async (label, key) => {
        mockSmallScreen();
        const { user, onAction } = renderMenu({ editingFlavor: mockFlavor });

        await user.click(screen.getByText(new RegExp(`^(> )?${label}$`)));

        expect(onAction).toHaveBeenCalledWith(key);
    });
});
