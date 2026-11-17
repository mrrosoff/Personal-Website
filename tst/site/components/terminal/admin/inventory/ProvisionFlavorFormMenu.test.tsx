import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { mockScreenWidth, mockTerminalTheme, renderWithApp } from "../../../../../helpers/render";
import { mockAdminState } from "../../../../../helpers/terminal";

import ProvisionFlavorFormMenu from "../../../../../../site/components/terminal/admin/inventory/ProvisionFlavorFormMenu";
import { AdminConsoleScreen } from "../../../../../../site/javascript-terminal/emulatorState/EmulatorState";
import type {
    AdminConsoleMode,
    ProvisionFlavorForm
} from "../../../../../../site/javascript-terminal/emulatorState/EmulatorState";

const blankForm: ProvisionFlavorForm = {
    flavorName: "",
    initialQuantity: 2,
    color: "",
    type: null,
    currentField: "flavorName"
};

function renderMenu(form: Partial<ProvisionFlavorForm> = {}) {
    const onAction = vi.fn();
    const consoleMode: AdminConsoleMode<AdminConsoleScreen.ProvisionFlavorForm> = {
        screen: AdminConsoleScreen.ProvisionFlavorForm,
        provisionForm: { ...blankForm, ...form }
    };
    const emulatorState = mockAdminState(consoleMode);
    const result = renderWithApp(
        <ProvisionFlavorFormMenu
            theme={mockTerminalTheme}
            onAction={onAction}
            mode={consoleMode}
        />,
        { emulatorState }
    );
    return { ...result, onAction, emulatorState };
}

describe("ProvisionFlavorFormMenu", () => {
    it("should show blanks for empty fields", () => {
        renderMenu();

        expect(screen.getByText(/Flavor Name: _/)).toHaveTextContent("> Flavor Name: _");
        expect(screen.getByText(/Color: _/)).toBeInTheDocument();
        expect(screen.getByText(/Type: Not Listed/)).toBeInTheDocument();
        expect(screen.getByText(/up\/down: navigate fields/)).toBeInTheDocument();
    });

    it("should show the values typed so far", () => {
        renderMenu({ flavorName: "Fig", color: "purple", type: "upcoming" });

        expect(screen.getByText(/Flavor Name: Fig/)).toBeInTheDocument();
        expect(screen.getByText(/Type: upcoming/)).toBeInTheDocument();
    });

    it("should hint how to change the type", () => {
        renderMenu({ currentField: "type" });

        expect(screen.getByText(/Type: Not Listed \(←\/→ to change\)/)).toBeInTheDocument();
    });

    it("should pick a field with a tap on a small screen", async () => {
        mockScreenWidth(390);
        const { user, onAction, emulatorState } = renderMenu();

        await user.click(screen.getByText(/Color:/));

        expect(emulatorState.getAdminConsoleMode()?.provisionForm?.currentField).toBe("color");
        expect(onAction).toHaveBeenCalledWith("");
        expect(screen.getByText("tap a field to edit")).toBeInTheDocument();
    });

    it("should step the type with buttons on a small screen", async () => {
        mockScreenWidth(390);
        const { user, onAction } = renderMenu({ currentField: "type" });

        await user.click(screen.getByText(">"));

        expect(onAction).toHaveBeenCalledWith("ArrowRight");
    });

    it.each([
        ["Continue", "Enter"],
        ["Cancel", "Escape"]
    ])("should %s with a tap on a small screen", async (label, key) => {
        mockScreenWidth(390);
        const { user, onAction } = renderMenu();

        await user.click(screen.getByText(new RegExp(label)));

        expect(onAction).toHaveBeenCalledWith(key);
    });
});
