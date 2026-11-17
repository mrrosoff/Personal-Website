import { act, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { mockSmallScreen, mockTerminalTheme, renderWithApp } from "../../../../helpers/render";
import { mockAdminState } from "../../../../helpers/terminal";
import { axiosGet } from "../../../../mocks/axios";

import { DeviceKind } from "../../../../../api/types";
import CreateFriendInviteMenu from "../../../../../site/components/terminal/admin/CreateFriendInviteMenu";
import { AdminConsoleScreen } from "../../../../../site/javascript-terminal/emulatorState/EmulatorState";
import type {
    AdminConsoleMode,
    FriendInvite
} from "../../../../../site/javascript-terminal/emulatorState/EmulatorState";

const blankInvite: FriendInvite = {
    friendName: "Zed",
    email: "",
    durationHours: 6,
    deviceIds: [],
    deviceIndex: 0,
    currentField: "friendName"
};

const inviteDevices = [
    { deviceId: "d1", kind: DeviceKind.POLAROID, name: "Ada's Polaroid" },
    { deviceId: "d2", kind: DeviceKind.SPOTIFY, name: "Unclaimed Spotify Display" }
];

function renderMenu(
    invite: Partial<FriendInvite> = {},
    mode: Partial<AdminConsoleMode<AdminConsoleScreen.CreateFriendInvite>> = { inviteDevices },
    environmentVariables?: Record<string, string>
) {
    const onAction = vi.fn();
    const consoleMode: AdminConsoleMode<AdminConsoleScreen.CreateFriendInvite> = {
        screen: AdminConsoleScreen.CreateFriendInvite,
        friendInvite: { ...blankInvite, ...invite },
        ...mode
    };
    const emulatorState = mockAdminState(consoleMode, environmentVariables);
    const result = renderWithApp(
        <CreateFriendInviteMenu theme={mockTerminalTheme} onAction={onAction} mode={consoleMode} />,
        { emulatorState }
    );
    return { ...result, onAction, emulatorState };
}

describe("CreateFriendInviteMenu", () => {
    it("should show the invite fields with a cursor", () => {
        renderMenu();

        expect(screen.getByText(/Friend Name/)).toHaveTextContent("> Friend Name: Zed_");
        expect(screen.getByText(/Link Lasts/)).toHaveTextContent("Link Lasts: 6 Hours");
        expect(screen.getByText(/Devices:/)).toHaveTextContent("Devices: None");
        expect(screen.getByText(/enter: create/)).toBeInTheDocument();
    });

    it("should hint how to change the duration", () => {
        renderMenu({ currentField: "durationHours" });

        expect(screen.getByText(/Link Lasts/)).toHaveTextContent(
            "> Link Lasts: 6 Hours_ (type hours or ←/→)"
        );
    });

    it("should list the chosen devices", () => {
        renderMenu({ deviceIds: ["d1", "d2"] });

        expect(screen.getByText(/Devices:/)).toHaveTextContent(
            "Devices: Ada's Polaroid, Unclaimed Spotify Display"
        );
    });

    it("should list every device with checkboxes when choosing", () => {
        renderMenu({ currentField: "devices", deviceIds: ["d2"], deviceIndex: 1 });

        expect(screen.getByText(/Ada's Polaroid/)).toHaveTextContent("[ ] Ada's Polaroid");
        expect(screen.getByText(/\[x\]/)).toHaveTextContent("› [x] Unclaimed Spotify Display");
    });

    it("should say when no devices are registered", () => {
        renderMenu({}, { inviteDevices: [] });

        expect(screen.getByText(/Devices:/)).toHaveTextContent("Devices: None Registered");
    });

    it("should load the devices", async () => {
        axiosGet.mockResolvedValue({ data: { devices: inviteDevices } });

        const { onAction, emulatorState } = renderMenu({}, {});

        expect(screen.getByText(/Devices:/)).toHaveTextContent("Devices: Loading");
        await waitFor(() => expect(onAction).toHaveBeenCalledWith(""));
        expect(emulatorState.getAdminConsoleMode()?.inviteDevices).toEqual(inviteDevices);
        expect(axiosGet).toHaveBeenCalledWith("https://api.maxrosoff.com/admin/devices", {
            headers: { Authorization: "Bearer token" }
        });
    });

    it("should treat a failed device load as none", async () => {
        axiosGet.mockRejectedValue(new Error("offline"));

        const { onAction, emulatorState } = renderMenu({}, {});

        await waitFor(() => expect(onAction).toHaveBeenCalled());
        expect(emulatorState.getAdminConsoleMode()?.inviteDevices).toEqual([]);
    });

    it("should not load devices without a sign in", () => {
        renderMenu({}, {}, {});

        expect(axiosGet).not.toHaveBeenCalled();
    });

    it("should say when it is creating", () => {
        renderMenu({}, { inviteDevices, loading: true });

        expect(screen.getByText(/Friend Name/)).toHaveTextContent("> Friend Name: Zed");
        expect(screen.getByText(/^Loading/)).toBeInTheDocument();
    });

    it("should show the link and how long it lasts", () => {
        renderMenu({ url: "https://maxrosoff.com/register-friend?token=t", durationHours: 24 });

        expect(
            screen.getByText("https://maxrosoff.com/register-friend?token=t")
        ).toBeInTheDocument();
        expect(screen.getByText("Good for 1 Day")).toBeInTheDocument();
        expect(screen.getByText("click copy for full url | escape: back")).toBeInTheDocument();
    });

    it("should say who the link was emailed to", () => {
        renderMenu({ url: "u", email: "zed@example.com" });

        expect(
            screen.getByText("Emailed to zed@example.com, good for 6 Hours")
        ).toBeInTheDocument();
    });

    it("should copy the link", async () => {
        const { user } = renderMenu({ url: "https://maxrosoff.com/register-friend?token=t" });
        const writeText = vi.spyOn(navigator.clipboard, "writeText");

        await user.click(screen.getByRole("button"));

        expect(writeText).toHaveBeenCalledWith("https://maxrosoff.com/register-friend?token=t");
        expect(await screen.findByTestId("CheckIcon")).toBeInTheDocument();
    });

    it("should go back to the copy icon after a moment", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const { user } = renderMenu({ url: "u" });

        await user.click(screen.getByRole("button"));
        await screen.findByTestId("CheckIcon");
        await act(() => vi.advanceTimersByTimeAsync(1500));

        expect(screen.getByTestId("ContentCopyIcon")).toBeInTheDocument();
        vi.useRealTimers();
    });

    it("should pick a field with a tap on a small screen", async () => {
        mockSmallScreen();
        const { user, onAction, emulatorState } = renderMenu();

        await user.click(screen.getByText(/Email:/));

        expect(emulatorState.getAdminConsoleMode()?.friendInvite?.currentField).toBe("email");
        expect(onAction).toHaveBeenCalledWith("");
        expect(screen.getByText("tap a field to edit, then Create")).toBeInTheDocument();
    });

    it("should step the duration with buttons on a small screen", async () => {
        mockSmallScreen();
        const { user, onAction } = renderMenu({ currentField: "durationHours" });

        await user.click(screen.getByText(">"));

        expect(onAction).toHaveBeenCalledWith("ArrowRight");
    });

    it("should toggle a device with a tap on a small screen", async () => {
        mockSmallScreen();
        const { user, onAction, emulatorState } = renderMenu({ currentField: "devices" });

        await user.click(screen.getByText(/Unclaimed Spotify Display/));

        expect(emulatorState.getAdminConsoleMode()?.friendInvite?.deviceIndex).toBe(1);
        expect(onAction).toHaveBeenCalledWith(" ");
        expect(screen.getByText(/Ada's Polaroid/)).not.toHaveTextContent("›");
    });

    it("should not create without a name", async () => {
        mockSmallScreen();
        const { user, onAction } = renderMenu({ friendName: "" });

        await user.click(screen.getByText(/^(> )?Create$/));

        expect(onAction).not.toHaveBeenCalled();
    });

    it("should create and cancel with taps", async () => {
        mockSmallScreen();
        const { user, onAction } = renderMenu();

        await user.click(screen.getByText(/^(> )?Create$/));
        await user.click(screen.getByText(/^(> )?Cancel$/));

        expect(onAction.mock.calls).toEqual([["Enter"], ["Escape"]]);
    });

    it("should go back with a tap once the link is made", async () => {
        mockSmallScreen();
        const { user, onAction } = renderMenu({ url: "u" });

        await user.click(screen.getByText(/^(> )?Back$/));

        expect(onAction).toHaveBeenCalledWith("Escape");
        expect(screen.getByText("tap copy for full url")).toBeInTheDocument();
    });
});
