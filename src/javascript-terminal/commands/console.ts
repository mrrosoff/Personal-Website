import axios from "axios";

import { API_ENDPOINT_URL, FLAVOR_TYPES, type FlavorType, UserType } from "../../../api/types";
import { decodeToken } from "../../auth";
import EmulatorState, { AdminConsoleScreen, MainMenuOption } from "../emulator-state/EmulatorState";
import { handleAddMailingListEntry } from "./console/mailingList/addMailingListEntry";
import { handleConfirmProvisionFlavor } from "./console/inventory/confirmProvisionFlavor";
import { handleConfirmSendEmails } from "./console/mailingList/confirmSendEmails";
import { handleCreateFriendInvite } from "./console/createFriendInvite";
import { handleIceCreamInventory } from "./console/inventory/iceCreamInventory";
import { handleMainMenu } from "./console/mainMenu";
import { handleProvisionFlavorForm } from "./console/inventory/provisionFlavorForm";
import { handleSelectFlavor } from "./console/inventory/selectFlavor";

const FLAVOR_TYPE_OPTIONS: (FlavorType | null)[] = [...FLAVOR_TYPES, null];

export function isPrintableKey(key: string): boolean {
    return [...key].length === 1;
}

export function editText(value: string, key: string): string {
    if (key === "Backspace") {
        return [...value].slice(0, -1).join("");
    }
    return isPrintableKey(key) ? value + key : value;
}

export function editNumber(value: number, key: string, max: number): number {
    if (key === "Backspace") {
        return Math.floor(value / 10);
    }
    return /^[0-9]$/.test(key) ? Math.min(value * 10 + Number(key), max) : value;
}

export function stepWithin<T>(options: T[], current: T, step: number): T {
    const index = Math.min(Math.max(options.indexOf(current) + step, 0), options.length - 1);
    return options[index];
}

export function stepAround<T>(options: T[], current: T, step: number): T {
    const index = (options.indexOf(current) + step + options.length) % options.length;
    return options[index];
}

export function cycleFlavorType(type: FlavorType | null, step: number): FlavorType | null {
    return stepAround(FLAVOR_TYPE_OPTIONS, type, step);
}

export function arrowStep(key: string): number {
    return key === "ArrowUp" || key === "ArrowLeft" ? -1 : 1;
}

export async function postAsAdmin<T>(
    state: EmulatorState,
    path: string,
    body: object = {}
): Promise<T> {
    const { data } = await axios.post<T>(`${API_ENDPOINT_URL}${path}`, body, {
        headers: { Authorization: `Bearer ${state.getEnvVariables().AUTH_TOKEN}` }
    });
    return data;
}

export function errorMessageFrom(err: unknown, fallback: string): string {
    if (axios.isAxiosError(err)) {
        return (err.response?.data as { message?: string } | undefined)?.message ?? fallback;
    }
    return fallback;
}

export function setAdminConsoleError(state: EmulatorState, err: unknown, fallback: string): void {
    console.error(fallback, err);
    state.setAdminConsoleMode({
        ...state.getAdminConsoleMode(),
        loading: false,
        error: errorMessageFrom(err, fallback)
    });
}

function screenHandler(
    screen: AdminConsoleScreen
): (key: string, state: EmulatorState) => EmulatorState | Promise<EmulatorState> {
    switch (screen) {
        case AdminConsoleScreen.Main:
            return handleMainMenu;
        case AdminConsoleScreen.IceCreamInventory:
            return handleIceCreamInventory;
        case AdminConsoleScreen.SelectFlavor:
            return handleSelectFlavor;
        case AdminConsoleScreen.ConfirmSendEmails:
            return handleConfirmSendEmails;
        case AdminConsoleScreen.ProvisionFlavorForm:
            return handleProvisionFlavorForm;
        case AdminConsoleScreen.ConfirmProvisionFlavor:
            return handleConfirmProvisionFlavor;
        case AdminConsoleScreen.CreateFriendInvite:
            return handleCreateFriendInvite;
        case AdminConsoleScreen.AddMailingListEntry:
            return handleAddMailingListEntry;
    }
}

export async function handleAdminConsoleKeyPress(
    key: string,
    state: EmulatorState,
    ctrlKey = false
): Promise<EmulatorState> {
    const mode = state.getAdminConsoleMode();
    if (!mode?.screen) return state;

    if (key === "c" && ctrlKey) {
        state.setAdminConsoleMode(undefined);
        return state;
    }

    if (mode.loading) return state;

    if (mode.error) {
        state.setAdminConsoleMode({ ...mode, error: undefined });
    }

    return screenHandler(mode.screen)(key, state);
}

export const optDef = {};

const functionDef = (state: EmulatorState, _commandOptions: string[]) => {
    if (state.getAdminConsoleMode()?.screen) {
        return { output: "", type: "text" };
    }

    const token = state.getEnvVariables().AUTH_TOKEN;
    if (decodeToken(token ?? "")?.userType !== UserType.ADMIN) {
        return { output: "Permission Denied", type: "error" };
    }

    state.setAdminConsoleMode({
        screen: AdminConsoleScreen.Main,
        selectedOption: MainMenuOption.IceCreamInventory
    });
    return { output: "", type: "text" };
};

export const manPage = `NAME
     console -- admin console interface

SYNOPSIS
     console

DESCRIPTION
     Opens the administrative console for managing ice cream inventory,
     sending marketing emails, and managing the mailing list. Requires
     authentication via password prompt.`;

export default { optDef, functionDef, manPage };
