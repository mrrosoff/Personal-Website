import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { mockTerminalTheme, renderWithApp } from "../../../../../helpers/render";

import MenuItem from "../../../../../../site/components/terminal/admin/common/MenuItem";

describe("MenuItem", () => {
    it("should point at and highlight the selected item", () => {
        renderWithApp(
            <MenuItem selected theme={mockTerminalTheme}>
                {"Inventory"}
            </MenuItem>
        );

        expect(screen.getByText(/Inventory/)).toHaveTextContent("> Inventory");
        expect(screen.getByText(/Inventory/)).toHaveStyle({
            color: mockTerminalTheme.commandColor
        });
    });

    it("should leave an unselected item plain", () => {
        renderWithApp(
            <MenuItem selected={false} theme={mockTerminalTheme}>
                {"Inventory"}
            </MenuItem>
        );

        expect(screen.getByText(/Inventory/)).not.toHaveTextContent(">");
    });

    it("should call back when clicked", async () => {
        const onClick = vi.fn();
        const { user } = renderWithApp(
            <MenuItem selected={false} theme={mockTerminalTheme} onClick={onClick}>
                {"Inventory"}
            </MenuItem>
        );

        await user.click(screen.getByText(/Inventory/));

        expect(onClick).toHaveBeenCalled();
    });

    it("should ignore clicks when disabled", async () => {
        const onClick = vi.fn();
        const { user } = renderWithApp(
            <MenuItem selected={false} theme={mockTerminalTheme} disabled onClick={onClick}>
                {"Inventory"}
            </MenuItem>
        );

        await user.click(screen.getByText(/Inventory/));

        expect(onClick).not.toHaveBeenCalled();
        expect(screen.getByText(/Inventory/)).toHaveStyle({ opacity: "0.4" });
    });
});
