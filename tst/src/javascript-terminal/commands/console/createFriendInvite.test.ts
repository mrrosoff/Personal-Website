import { describe, expect, it } from "vitest";

import { mockAdminState } from "../../../../helpers/terminal";
import { axiosPost } from "../../../../__mocks__/axios";
import { mockDevice } from "../../../../__mocks__/__data__/aws/dynamodb";

import { DeviceKind } from "../../../../../api/types";
import { handleAdminConsoleKeyPress } from "../../../../../src/javascript-terminal/commands/console";
import {
    AdminConsoleScreen,
    type FriendInvite
} from "../../../../../src/javascript-terminal/emulator-state/EmulatorState";

const blankInvite: FriendInvite = {
    friendName: "Zed",
    email: "",
    durationHours: 6,
    deviceIds: [],
    deviceIndex: 0,
    currentField: "friendName"
};

const inviteDevices = [
    { deviceId: mockDevice.deviceId, kind: DeviceKind.POLAROID, name: "Polaroid" },
    { deviceId: "other", kind: DeviceKind.SPOTIFY, name: "Spotify" }
];

function invite(changes: Partial<FriendInvite> = {}, devices = inviteDevices) {
    return mockAdminState({
        screen: AdminConsoleScreen.CreateFriendInvite,
        friendInvite: { ...blankInvite, ...changes },
        inviteDevices: devices
    });
}

async function press(key: string, state = invite()) {
    return (await handleAdminConsoleKeyPress(key, state)).getAdminConsoleMode()!;
}

describe("handleCreateFriendInvite", () => {
    it("should go back to the main menu on escape", async () => {
        const result = await press("Escape");

        expect(result).toMatchObject({ screen: AdminConsoleScreen.Main, friendInvite: undefined });
    });

    it("should ignore keys once the invite is made", async () => {
        const result = await press("a", invite({ url: "https://maxrosoff.com/register-friend" }));

        expect(result.friendInvite?.friendName).toBe("Zed");
    });

    it("should move between fields", async () => {
        const result = await press("ArrowUp");

        expect(result.friendInvite?.currentField).toBe("devices");
    });

    it("should type into the name, spaces included", async () => {
        const result = await press(" ");

        expect(result.friendInvite?.friendName).toBe("Zed ");
    });

    it("should delete from the email", async () => {
        const result = await press("Backspace", invite({ email: "z@", currentField: "email" }));

        expect(result.friendInvite?.email).toBe("z");
    });

    it("should type a duration", async () => {
        const result = await press(
            "2",
            invite({ durationHours: 1, currentField: "durationHours" })
        );

        expect(result.friendInvite?.durationHours).toBe(12);
    });

    it("should nudge the duration with arrows", async () => {
        const result = await press("ArrowRight", invite({ currentField: "durationHours" }));

        expect(result.friendInvite?.durationHours).toBe(7);
    });

    it("should not nudge a text field", async () => {
        const result = await press("ArrowLeft");

        expect(result.friendInvite).toEqual(blankInvite);
    });

    it("should move between devices", async () => {
        const result = await press("ArrowLeft", invite({ currentField: "devices" }));

        expect(result.friendInvite?.deviceIndex).toBe(1);
    });

    it("should not move when there are no devices", async () => {
        const result = await press("ArrowRight", invite({ currentField: "devices" }, []));

        expect(result.friendInvite?.deviceIndex).toBe(0);
    });

    it("should pick a device with space", async () => {
        const result = await press(" ", invite({ currentField: "devices" }));

        expect(result.friendInvite?.deviceIds).toEqual([mockDevice.deviceId]);
    });

    it("should unpick a device with space", async () => {
        const result = await press(
            " ",
            invite({ currentField: "devices", deviceIds: [mockDevice.deviceId] })
        );

        expect(result.friendInvite?.deviceIds).toEqual([]);
    });

    it("should do nothing with space when there are no devices", async () => {
        const result = await press(" ", invite({ currentField: "devices" }, []));

        expect(result.friendInvite?.deviceIds).toEqual([]);
    });

    it("should not type into the devices", async () => {
        const result = await press("a", invite({ currentField: "devices" }));

        expect(result.friendInvite?.deviceIds).toEqual([]);
    });

    it("should need a name to send", async () => {
        await press("Enter", invite({ friendName: "  " }));

        expect(axiosPost).not.toHaveBeenCalled();
    });

    it("should refuse an invalid email", async () => {
        const result = await press("Enter", invite({ email: "nope" }));

        expect(result.error).toBe("Enter A Valid Email Address");
    });

    it("should create the invite and show its link", async () => {
        axiosPost.mockResolvedValue({ data: { url: "https://maxrosoff.com/register-friend" } });

        const result = await press(
            "Enter",
            invite({
                friendName: " Zed ",
                email: " z@example.com ",
                deviceIds: ["d1"],
                durationHours: 500
            })
        );

        expect(axiosPost).toHaveBeenCalledWith(
            "https://api.maxrosoff.com/admin/create-friend-invite",
            { friendName: "Zed", expiresInHours: 168, email: "z@example.com", deviceIds: ["d1"] },
            expect.any(Object)
        );
        expect(result).toMatchObject({
            loading: false,
            friendInvite: { url: "https://maxrosoff.com/register-friend", email: "z@example.com" }
        });
    });

    it("should leave out an empty email and device list", async () => {
        axiosPost.mockResolvedValue({ data: { url: "u" } });

        await press("Enter");

        expect(axiosPost).toHaveBeenCalledWith(
            expect.any(String),
            { friendName: "Zed", expiresInHours: 6 },
            expect.any(Object)
        );
    });

    it("should show an error when creating fails", async () => {
        axiosPost.mockRejectedValue(new Error("offline"));

        const result = await press("Enter");

        expect(result.error).toBe("Failed To Create Friend Invite");
    });

    it("should move down through the fields", async () => {
        const result = await press("ArrowDown");

        expect(result.friendInvite?.currentField).toBe("email");
    });

    it("should treat a missing device list as empty", async () => {
        const state = mockAdminState({
            screen: AdminConsoleScreen.CreateFriendInvite,
            friendInvite: { ...blankInvite, currentField: "devices" }
        });

        const result = await press(" ", state);

        expect(result.friendInvite?.deviceIds).toEqual([]);
    });
});
