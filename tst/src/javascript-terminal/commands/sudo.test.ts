import { describe, expect, it } from "vitest";

import { mockShell, mockToken } from "../../../setup";
import { UserType } from "../../../../api/types";

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
});
