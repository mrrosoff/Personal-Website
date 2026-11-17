import { startAuthentication } from "@simplewebauthn/browser";
import { describe, expect, it, vi } from "vitest";

import { mockToken } from "../../../setup";
import { mockShell } from "../../../helpers/terminal";
import { axiosPost } from "../../../__mocks__/axios";
import { UserType } from "../../../../api/types";
import {
    authenticateWithPasskey,
    signInWithPasskey
} from "../../../../src/javascript-terminal/commands/sudo";

vi.mock("@simplewebauthn/browser", () => ({ startAuthentication: vi.fn() }));

describe("sudo", () => {
    it("should need a command", () => {
        const shell = mockShell();

        const result = shell.run("sudo");

        expect(result).toBe('Must Specify A Command To Run With "sudo"');
    });

    it("should ask for a passkey when signed out", () => {
        const shell = mockShell();

        shell.run("sudo console");

        expect(shell.state.getPasswordPromptState()).toEqual({
            targetCommand: "console",
            targetOptions: []
        });
    });

    it("should run the command when signed in", async () => {
        const shell = mockShell({ AUTH_TOKEN: await mockToken(UserType.ADMIN) });

        const result = shell.run("sudo pwd");

        expect(result).toBe("/");
    });

    it("should fail on an unknown command", async () => {
        const shell = mockShell({ AUTH_TOKEN: await mockToken(UserType.ADMIN) });

        const result = shell.run("sudo nope");

        expect(result).toBe("Command Not Found");
    });

    it("should report the error from a command that crashes", async () => {
        const shell = mockShell({ AUTH_TOKEN: await mockToken(UserType.ADMIN) });
        shell.state.setCommandMapping({
            ...shell.state.getCommandMapping(),
            boom: {
                optDef: {},
                functionDef: () => {
                    throw new Error("boom");
                }
            }
        });

        const result = shell.run("sudo boom");

        expect(result).toBe("boom");
    });
});

describe("signInWithPasskey", () => {
    it("should sign in with a passkey and remember the token", async () => {
        const setItem = vi.fn();
        vi.stubGlobal("sessionStorage", { setItem });
        axiosPost
            .mockResolvedValueOnce({ data: { challenge: "challenge" } })
            .mockResolvedValueOnce({ data: { token: "token" } });
        vi.mocked(startAuthentication).mockResolvedValue({ id: "credential" } as never);

        const result = await signInWithPasskey();

        expect(result).toBe("token");
        expect(axiosPost).toHaveBeenLastCalledWith("https://api.maxrosoff.com/admin/passkey-auth", {
            response: { id: "credential" },
            challenge: "challenge"
        });
        expect(setItem).toHaveBeenCalledWith("AUTH_TOKEN", "token");
    });
});

describe("authenticateWithPasskey", () => {
    function promptFor(targetCommand?: string, targetOptions: string[] = []) {
        const shell = mockShell();
        shell.run(targetCommand ? `sudo ${[targetCommand, ...targetOptions].join(" ")}` : "pwd");
        if (!targetCommand) shell.state.setPasswordPromptState({});
        return shell;
    }

    function signInSucceeds(token: string) {
        vi.stubEnv("DEV", false);
        vi.stubGlobal("sessionStorage", { setItem: vi.fn(), removeItem: vi.fn() });
        axiosPost
            .mockResolvedValueOnce({ data: { challenge: "challenge" } })
            .mockResolvedValueOnce({ data: { token } });
    }

    it("should do nothing without a prompt", async () => {
        const shell = mockShell();

        await authenticateWithPasskey(shell.emulator, shell.state);

        expect(axiosPost).not.toHaveBeenCalled();
    });

    it("should explain passkeys are unavailable locally", async () => {
        const shell = promptFor("pwd");

        await authenticateWithPasskey(shell.emulator, shell.state);

        expect(shell.state.getOutputs().at(-1)?.output).toEqual([
            { output: "Passkey Auth Unavailable In Local Environment", type: "error" }
        ]);
    });

    it("should clear the prompt locally even with nothing on screen", async () => {
        const shell = mockShell();
        shell.state.setPasswordPromptState({ targetCommand: "pwd", targetOptions: [] });

        await authenticateWithPasskey(shell.emulator, shell.state);

        expect(shell.state.getPasswordPromptState()).toBeUndefined();
    });

    it("should sign in and run the waiting command", async () => {
        signInSucceeds(await mockToken(UserType.ADMIN));
        const shell = promptFor("whoami");

        await authenticateWithPasskey(shell.emulator, shell.state);

        expect(shell.state.getOutputs().at(-1)?.output).toEqual([{ output: "admin" }]);
        expect(shell.state.getPasswordPromptState()).toBeUndefined();
    });

    it("should just sign in when nothing is waiting", async () => {
        signInSucceeds("token");
        const shell = promptFor();

        await authenticateWithPasskey(shell.emulator, shell.state);

        expect(shell.state.getEnvVariables()["AUTH_TOKEN"]).toBe("token");
    });

    it("should sign back out when su fails", async () => {
        signInSucceeds(await mockToken(UserType.FRIEND));
        const shell = promptFor("su", ["somebody"]);

        await authenticateWithPasskey(shell.emulator, shell.state);

        expect(shell.state.getEnvVariables()["AUTH_TOKEN"]).toBeUndefined();
        expect(sessionStorage.removeItem).toHaveBeenCalledWith("AUTH_TOKEN");
    });

    it("should keep the sign in when su succeeds", async () => {
        signInSucceeds(await mockToken(UserType.ADMIN));
        const shell = promptFor("su", ["admin"]);

        await authenticateWithPasskey(shell.emulator, shell.state);

        expect(shell.state.getEnvVariables()["AUTH_TOKEN"]).toBeDefined();
    });

    it("should run the command even with nothing on screen", async () => {
        signInSucceeds("token");
        const shell = mockShell();
        shell.state.setPasswordPromptState({ targetCommand: "pwd", targetOptions: [] });

        await authenticateWithPasskey(shell.emulator, shell.state);

        expect(shell.state.getOutputs()).toBeEmpty();
    });

    it("should report a failed sign in", async () => {
        vi.stubEnv("DEV", false);
        axiosPost.mockRejectedValue(new Error("cancelled"));
        const shell = promptFor("pwd");

        await authenticateWithPasskey(shell.emulator, shell.state);

        expect(shell.state.getOutputs().at(-1)?.output).toEqual([
            { output: "Authentication Failed", type: "error" }
        ]);
    });

    it("should report a failed sign in with nothing on screen", async () => {
        vi.stubEnv("DEV", false);
        axiosPost.mockRejectedValue(new Error("cancelled"));
        const shell = mockShell();
        shell.state.setPasswordPromptState({});

        await authenticateWithPasskey(shell.emulator, shell.state);

        expect(shell.state.getPasswordPromptState()).toBeUndefined();
    });
});
