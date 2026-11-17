import { describe, expect, it } from "vitest";

import { mockToken } from "../../../setup";
import { mockAdminState, mockShell } from "../../../helpers/terminal";
import { AxiosError, axiosPost } from "../../../__mocks__/axios";

import { UserType } from "../../../../api/types";
import {
    handleAdminConsoleKeyPress,
    arrowStep,
    cycleFlavorType,
    editNumber,
    editText,
    errorMessageFrom,
    isPrintableKey,
    postAsAdmin,
    setAdminConsoleError,
    stepAround,
    stepWithin
} from "../../../../src/javascript-terminal/commands/console";
import EmulatorState, {
    AdminConsoleScreen,
    MainMenuOption
} from "../../../../src/javascript-terminal/emulator-state/EmulatorState";

describe("console", () => {
    it("should deny a signed out visitor", () => {
        const shell = mockShell();

        const result = shell.run("console");

        expect(result).toBe("Permission Denied");
    });

    it("should deny a friend", async () => {
        const shell = mockShell({ AUTH_TOKEN: await mockToken(UserType.FRIEND) });

        const result = shell.run("console");

        expect(result).toBe("Permission Denied");
    });

    it("should open the main menu for the admin", async () => {
        const shell = mockShell({ AUTH_TOKEN: await mockToken(UserType.ADMIN) });

        shell.run("console");

        expect(shell.state.getAdminConsoleMode()).toEqual({
            screen: "main",
            selectedOption: "IceCreamInventory"
        });
    });

    it("should leave an open console alone", async () => {
        const shell = mockShell({ AUTH_TOKEN: await mockToken(UserType.ADMIN) });
        shell.state.setAdminConsoleMode({ screen: "select-flavor" as never });

        shell.run("console");

        expect(shell.state.getAdminConsoleMode()?.screen).toBe("select-flavor");
    });
});

describe("isPrintableKey", () => {
    it("should accept a single character", () => {
        expect(isPrintableKey("a")).toBe(true);
        expect(isPrintableKey("😀")).toBe(true);
    });

    it("should reject a named key", () => {
        expect(isPrintableKey("Shift")).toBe(false);
    });
});

describe("editText", () => {
    it("should type a character", () => {
        expect(editText("ab", "c")).toBe("abc");
    });

    it("should delete the last character", () => {
        expect(editText("ab😀", "Backspace")).toBe("ab");
    });

    it("should ignore a named key", () => {
        expect(editText("ab", "Shift")).toBe("ab");
    });
});

describe("editNumber", () => {
    it("should type a digit", () => {
        expect(editNumber(12, "3", 9999)).toBe(123);
    });

    it("should stop at the maximum", () => {
        expect(editNumber(999, "9", 168)).toBe(168);
    });

    it("should delete the last digit", () => {
        expect(editNumber(123, "Backspace", 9999)).toBe(12);
    });

    it("should ignore anything else", () => {
        expect(editNumber(12, "a", 9999)).toBe(12);
    });
});

describe("stepWithin", () => {
    it("should stop at either end", () => {
        expect(stepWithin(["a", "b"], "b", 1)).toBe("b");
        expect(stepWithin(["a", "b"], "a", -1)).toBe("a");
    });
});

describe("stepAround", () => {
    it("should wrap around either end", () => {
        expect(stepAround(["a", "b"], "b", 1)).toBe("a");
        expect(stepAround(["a", "b"], "a", -1)).toBe("b");
    });
});

describe("cycleFlavorType", () => {
    it("should cycle through every type and none", () => {
        expect(cycleFlavorType("upcoming", 1)).toBeNull();
        expect(cycleFlavorType(null, 1)).toBe("currentFlavor");
    });
});

describe("arrowStep", () => {
    it("should step back for up and left", () => {
        expect(arrowStep("ArrowUp")).toBe(-1);
        expect(arrowStep("ArrowLeft")).toBe(-1);
    });

    it("should step forward for everything else", () => {
        expect(arrowStep("ArrowDown")).toBe(1);
        expect(arrowStep("Tab")).toBe(1);
    });
});

describe("postAsAdmin", () => {
    it("should post with the admin's token", async () => {
        axiosPost.mockResolvedValue({ data: { ok: true } });
        const state = EmulatorState.create({ environmentVariables: { AUTH_TOKEN: "token" } });

        const result = await postAsAdmin(state, "/admin/thing", { a: 1 });

        expect(result).toEqual({ ok: true });
        expect(axiosPost).toHaveBeenCalledWith(
            "https://api.maxrosoff.com/admin/thing",
            { a: 1 },
            { headers: { Authorization: "Bearer token" } }
        );
    });

    it("should send an empty body by default", async () => {
        const state = EmulatorState.create({});

        await postAsAdmin(state, "/admin/thing");

        expect(axiosPost).toHaveBeenCalledWith(expect.any(String), {}, expect.any(Object));
    });
});

describe("errorMessageFrom", () => {
    it("should use the API's message", () => {
        const err = new AxiosError("failed", "400", undefined, undefined, {
            data: { message: "Name Taken" }
        } as never);

        expect(errorMessageFrom(err, "Fallback")).toBe("Name Taken");
    });

    it("should fall back without an API message", () => {
        expect(errorMessageFrom(new AxiosError("failed"), "Fallback")).toBe("Fallback");
    });

    it("should fall back for any other error", () => {
        expect(errorMessageFrom(new Error("boom"), "Fallback")).toBe("Fallback");
    });
});

describe("setAdminConsoleError", () => {
    it("should stop loading and show the error", () => {
        const state = EmulatorState.create({});
        state.setAdminConsoleMode({ screen: "main" as never, loading: true });

        setAdminConsoleError(state, new Error("boom"), "Failed");

        expect(state.getAdminConsoleMode()).toEqual({
            screen: "main",
            loading: false,
            error: "Failed"
        });
    });
});

const mainMenu = {
    screen: AdminConsoleScreen.Main,
    selectedOption: MainMenuOption.IceCreamInventory
};

describe("handleAdminConsoleKeyPress", () => {
    it("should ignore keys when the console is closed", async () => {
        const state = EmulatorState.create({});

        await handleAdminConsoleKeyPress("Enter", state);

        expect(state.getAdminConsoleMode()).toBeUndefined();
    });

    it("should ignore keys without a screen", async () => {
        const state = mockAdminState({ error: "Oops" });

        await handleAdminConsoleKeyPress("Enter", state);

        expect(state.getAdminConsoleMode()).toEqual({ error: "Oops" });
    });

    it("should close the console on ctrl+c", async () => {
        const state = mockAdminState(mainMenu);

        await handleAdminConsoleKeyPress("c", state, true);

        expect(state.getAdminConsoleMode()).toBeUndefined();
    });

    it("should ignore keys while loading", async () => {
        const state = mockAdminState({ ...mainMenu, loading: true });

        await handleAdminConsoleKeyPress("ArrowDown", state);

        expect(state.getAdminConsoleMode()?.selectedOption).toBe(MainMenuOption.IceCreamInventory);
    });

    it("should clear an error on the next key", async () => {
        const state = mockAdminState({ ...mainMenu, error: "Oops" });

        await handleAdminConsoleKeyPress("Shift", state);

        expect(state.getAdminConsoleMode()?.error).toBeUndefined();
    });

    it("should hand the key to the current screen", async () => {
        const state = mockAdminState(mainMenu);

        await handleAdminConsoleKeyPress("ArrowDown", state);

        expect(state.getAdminConsoleMode()?.selectedOption).toBe(
            MainMenuOption.SendMarketingEmails
        );
    });

    it.each([
        [
            AdminConsoleScreen.IceCreamInventory,
            { selectedOption: "GoBack" },
            AdminConsoleScreen.Main
        ],
        [
            AdminConsoleScreen.SelectFlavor,
            { inventoryData: [], selectedOption: 0 },
            AdminConsoleScreen.IceCreamInventory
        ],
        [AdminConsoleScreen.ConfirmSendEmails, {}, AdminConsoleScreen.Main],
        [
            AdminConsoleScreen.ProvisionFlavorForm,
            { provisionForm: {} },
            AdminConsoleScreen.IceCreamInventory
        ],
        [
            AdminConsoleScreen.ConfirmProvisionFlavor,
            { provisionForm: {} },
            AdminConsoleScreen.ProvisionFlavorForm
        ],
        [AdminConsoleScreen.CreateFriendInvite, { friendInvite: {} }, AdminConsoleScreen.Main],
        [AdminConsoleScreen.AddMailingListEntry, { mailingListEntry: {} }, AdminConsoleScreen.Main]
    ])("should send escape on the %s screen to that screen", async (screen, mode, expected) => {
        const state = mockAdminState({ screen, ...mode } as never);

        await handleAdminConsoleKeyPress("Escape", state);

        expect(state.getAdminConsoleMode()?.screen).toBe(expected);
    });
});
