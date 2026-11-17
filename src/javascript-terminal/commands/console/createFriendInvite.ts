import { validate } from "email-validator";

import EmulatorState, {
    AdminConsoleScreen,
    type FriendInvite,
    type InviteDevice,
    MainMenuOption
} from "../../emulator-state/EmulatorState";
import { SHARE_TOKEN_MAX_HOURS, SHARE_TOKEN_MIN_HOURS } from "../../../../api/common";
import {
    arrowStep,
    editNumber,
    editText,
    postAsAdmin,
    setAdminConsoleError,
    stepAround
} from "../console";

function clampDurationHours(hours: number): number {
    return Math.min(Math.max(hours, SHARE_TOKEN_MIN_HOURS), SHARE_TOKEN_MAX_HOURS);
}

const INVITE_FIELDS: Array<FriendInvite["currentField"]> = [
    "friendName",
    "email",
    "durationHours",
    "devices"
];

function adjustInvite(invite: FriendInvite, devices: InviteDevice[], step: number): FriendInvite {
    if (invite.currentField === "durationHours") {
        return { ...invite, durationHours: clampDurationHours(invite.durationHours + step) };
    }
    if (invite.currentField === "devices" && devices.length) {
        return {
            ...invite,
            deviceIndex: (invite.deviceIndex + step + devices.length) % devices.length
        };
    }
    return invite;
}

function toggleDevice(invite: FriendInvite, devices: InviteDevice[]): FriendInvite {
    const device = devices[invite.deviceIndex];
    if (invite.currentField !== "devices" || !device) {
        return invite;
    }
    return {
        ...invite,
        deviceIds: invite.deviceIds.includes(device.deviceId)
            ? invite.deviceIds.filter((id) => id !== device.deviceId)
            : [...invite.deviceIds, device.deviceId]
    };
}

function typeIntoInvite(invite: FriendInvite, key: string): FriendInvite {
    switch (invite.currentField) {
        case "durationHours":
            return {
                ...invite,
                durationHours: editNumber(invite.durationHours, key, SHARE_TOKEN_MAX_HOURS)
            };
        case "devices":
            return invite;
        default:
            return { ...invite, [invite.currentField]: editText(invite[invite.currentField], key) };
    }
}

async function sendInvite(state: EmulatorState, invite: FriendInvite): Promise<void> {
    const mode = state.getAdminConsoleMode()!;
    const email = invite.email.trim();
    if (email && !validate(email)) {
        state.setAdminConsoleMode({ ...mode, error: "Enter A Valid Email Address" });
        return;
    }

    const durationHours = clampDurationHours(invite.durationHours);
    state.setAdminConsoleMode({ ...mode, loading: true });
    try {
        const { url } = await postAsAdmin<{ url: string }>(state, "/admin/create-friend-invite", {
            friendName: invite.friendName.trim(),
            expiresInHours: durationHours,
            ...(email && { email }),
            ...(invite.deviceIds.length && { deviceIds: invite.deviceIds })
        });
        state.setAdminConsoleMode({
            ...state.getAdminConsoleMode(),
            friendInvite: { ...invite, durationHours, email, url },
            loading: false
        });
    } catch (err) {
        setAdminConsoleError(state, err, "Failed To Create Friend Invite");
    }
}

export async function handleCreateFriendInvite(
    key: string,
    state: EmulatorState
): Promise<EmulatorState> {
    const mode = state.getAdminConsoleMode()!;
    const invite = mode.friendInvite!;
    const devices = mode.inviteDevices ?? [];

    if (key === "Escape") {
        state.setAdminConsoleMode({
            ...mode,
            screen: AdminConsoleScreen.Main,
            selectedOption: MainMenuOption.CreateFriendInvite,
            friendInvite: undefined
        });
        return state;
    }

    if (invite.url) {
        return state;
    }

    switch (key) {
        case "ArrowDown":
        case "ArrowUp":
        case "Tab":
            state.setAdminConsoleMode({
                ...mode,
                friendInvite: {
                    ...invite,
                    currentField: stepAround(INVITE_FIELDS, invite.currentField, arrowStep(key))
                }
            });
            break;
        case "ArrowLeft":
        case "ArrowRight":
            state.setAdminConsoleMode({
                ...mode,
                friendInvite: adjustInvite(invite, devices, arrowStep(key))
            });
            break;
        case " ":
            state.setAdminConsoleMode({
                ...mode,
                friendInvite:
                    invite.currentField === "devices"
                        ? toggleDevice(invite, devices)
                        : typeIntoInvite(invite, key)
            });
            break;
        case "Enter":
            if (invite.friendName.trim()) {
                await sendInvite(state, invite);
            }
            break;
        default:
            state.setAdminConsoleMode({ ...mode, friendInvite: typeIntoInvite(invite, key) });
    }

    return state;
}
