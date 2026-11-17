import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { mockTerminalTheme, renderWithApp } from "../../../../helpers/render";
import { mockAdminState } from "../../../../helpers/terminal";

import AdminConsole from "../../../../../src/components/terminal/admin/AdminConsole";
import { AdminConsoleScreen } from "../../../../../src/javascript-terminal/emulator-state/EmulatorState";

const screens: Array<[AdminConsoleScreen, object, string]> = [
    [AdminConsoleScreen.Main, {}, "=== Admin Console ==="],
    [AdminConsoleScreen.IceCreamInventory, {}, "(Ice Cream Inventory)"],
    [AdminConsoleScreen.SelectFlavor, {}, "(Select Flavor)"],
    [AdminConsoleScreen.ConfirmSendEmails, {}, "(Send Marketing Emails)"],
    [
        AdminConsoleScreen.ProvisionFlavorForm,
        {
            provisionForm: {
                flavorName: "",
                initialQuantity: 1,
                color: "",
                type: null,
                currentField: "flavorName"
            }
        },
        "(Provision New Flavor)"
    ],
    [
        AdminConsoleScreen.ConfirmProvisionFlavor,
        {
            provisionForm: {
                flavorName: "",
                initialQuantity: 1,
                color: "",
                type: null,
                currentField: "flavorName"
            }
        },
        "(Confirm Provision Flavor)"
    ],
    [
        AdminConsoleScreen.CreateFriendInvite,
        {
            friendInvite: {
                friendName: "",
                email: "",
                durationHours: 6,
                deviceIds: [],
                deviceIndex: 0,
                currentField: "friendName"
            },
            inviteDevices: []
        },
        "(Create Friend Invite)"
    ],
    [
        AdminConsoleScreen.AddMailingListEntry,
        { mailingListEntry: { firstName: "", lastName: "", email: "", currentField: "firstName" } },
        "(Add To Mailing List)"
    ]
];

describe("AdminConsole", () => {
    it("should render nothing when the console is closed", () => {
        renderWithApp(<AdminConsole theme={mockTerminalTheme} onAction={vi.fn()} />);

        expect(screen.queryByText(/Admin Console/)).not.toBeInTheDocument();
    });

    it.each(screens)("should show the %s screen", (screenName, mode, heading) => {
        renderWithApp(<AdminConsole theme={mockTerminalTheme} onAction={vi.fn()} />, {
            emulatorState: mockAdminState({ screen: screenName, ...mode })
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
