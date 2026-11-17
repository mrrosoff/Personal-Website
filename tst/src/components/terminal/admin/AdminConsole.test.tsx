import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { mockTerminalTheme, renderWithApp } from "../../../../helpers/render";
import { mockAdminState } from "../../../../helpers/terminal";

import AdminConsole from "../../../../../src/components/terminal/admin/AdminConsole";
import {
    AdminConsoleScreen,
    type AdminConsoleState
} from "../../../../../src/javascript-terminal/emulator-state/EmulatorState";

const screens: [string, AdminConsoleState][] = [
    ["=== Admin Console ===", { screen: AdminConsoleScreen.Main }],
    ["(Ice Cream Inventory)", { screen: AdminConsoleScreen.IceCreamInventory }],
    ["(Select Flavor)", { screen: AdminConsoleScreen.SelectFlavor }],
    ["(Send Marketing Emails)", { screen: AdminConsoleScreen.ConfirmSendEmails }],
    [
        "(Provision New Flavor)",
        {
            screen: AdminConsoleScreen.ProvisionFlavorForm,
            provisionForm: {
                flavorName: "",
                initialQuantity: 1,
                color: "",
                type: null,
                currentField: "flavorName"
            }
        }
    ],
    [
        "(Confirm Provision Flavor)",
        {
            screen: AdminConsoleScreen.ConfirmProvisionFlavor,
            provisionForm: {
                flavorName: "",
                initialQuantity: 1,
                color: "",
                type: null,
                currentField: "flavorName"
            }
        }
    ],
    [
        "(Create Friend Invite)",
        {
            screen: AdminConsoleScreen.CreateFriendInvite,
            friendInvite: {
                friendName: "",
                email: "",
                durationHours: 6,
                deviceIds: [],
                deviceIndex: 0,
                currentField: "friendName"
            },
            inviteDevices: []
        }
    ],
    [
        "(Add To Mailing List)",
        {
            screen: AdminConsoleScreen.AddMailingListEntry,
            mailingListEntry: { firstName: "", lastName: "", email: "", currentField: "firstName" }
        }
    ]
];

describe("AdminConsole", () => {
    it("should render nothing when the console is closed", () => {
        renderWithApp(<AdminConsole theme={mockTerminalTheme} onAction={vi.fn()} />);

        expect(screen.queryByText(/Admin Console/)).not.toBeInTheDocument();
    });

    it.each(screens)("should show the %s screen", (heading, mode) => {
        renderWithApp(<AdminConsole theme={mockTerminalTheme} onAction={vi.fn()} />, {
            emulatorState: mockAdminState(mode)
        });

        expect(screen.getByText(heading, { exact: false })).toBeInTheDocument();
    });

    it("should show an error under the screen", () => {
        renderWithApp(<AdminConsole theme={mockTerminalTheme} onAction={vi.fn()} />, {
            emulatorState: mockAdminState({ screen: AdminConsoleScreen.Main, error: "Oops" })
        });

        expect(screen.getByText("Oops")).toHaveStyle({ color: mockTerminalTheme.errorColor });
    });
});
