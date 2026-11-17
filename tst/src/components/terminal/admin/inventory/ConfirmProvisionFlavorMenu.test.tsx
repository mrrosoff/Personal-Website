import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { mockSmallScreen, mockTerminalTheme, renderWithApp } from "../../../../../helpers/render";
import { mockAdminState } from "../../../../../helpers/terminal";

import ConfirmProvisionFlavorMenu from "../../../../../../src/components/terminal/admin/inventory/ConfirmProvisionFlavorMenu";
import {
    type AdminConsoleMode,
    AdminConsoleScreen
} from "../../../../../../src/javascript-terminal/emulator-state/EmulatorState";

const provisionForm = {
    flavorName: "Fig",
    initialQuantity: 4,
    color: "purple",
    type: "upcoming" as const,
    currentField: "flavorName" as const
};

function renderMenu(mode: object = {}) {
    const onAction = vi.fn();
    const consoleMode: AdminConsoleMode<AdminConsoleScreen.ConfirmProvisionFlavor> = {
        screen: AdminConsoleScreen.ConfirmProvisionFlavor,
        selectedOption: "yes",
        provisionForm,
        ...mode
    };
    const emulatorState = mockAdminState(consoleMode);
    const result = renderWithApp(
        <ConfirmProvisionFlavorMenu
            theme={mockTerminalTheme}
            onAction={onAction}
            mode={consoleMode}
        />,
        { emulatorState }
    );
    return { ...result, onAction, emulatorState };
}

describe("ConfirmProvisionFlavorMenu", () => {
    it("should list the new flavor's details", () => {
        renderMenu();

        expect(screen.getByText("Flavor Name: Fig")).toBeInTheDocument();
        expect(screen.getByText("Initial Quantity: 4")).toBeInTheDocument();
        expect(screen.getByText("Type: upcoming")).toBeInTheDocument();
        expect(screen.getByText(/left\/right: select option/)).toBeInTheDocument();
    });

    it("should say an unlisted flavor is not listed", () => {
        renderMenu({ provisionForm: { ...provisionForm, type: null } });

        expect(screen.getByText("Type: Not Listed")).toBeInTheDocument();
    });

    it("should say when it is saving", () => {
        renderMenu({ loading: true });

        expect(screen.getByText(/^Loading/)).toBeInTheDocument();
    });

    it.each(["yes", "no"])("should choose %s with a tap on a small screen", async (option) => {
        mockSmallScreen();
        const { user, onAction, emulatorState } = renderMenu({ selectedOption: "no" });

        await user.click(screen.getByText(option === "yes" ? /^(> )?Yes$/ : /^(> )?No$/));

        expect(emulatorState.getAdminConsoleMode()?.selectedOption).toBe(option);
        expect(onAction).toHaveBeenCalledWith("Enter");
        expect(screen.getByText("tap Yes or No")).toBeInTheDocument();
    });
});
