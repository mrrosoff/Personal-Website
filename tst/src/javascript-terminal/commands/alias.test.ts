import { describe, expect, it, vi } from "vitest";

import { mockShell } from "../../../helpers/terminal";
import aliasCommand from "../../../../src/javascript-terminal/commands/alias";
import EmulatorState from "../../../../src/javascript-terminal/emulator-state/EmulatorState";

describe("alias", () => {
    it("should print nothing when there are no aliases", () => {
        const shell = mockShell();

        const result = shell.run("alias");

        expect(result).toBe("");
    });

    it("should list a stored alias", () => {
        const shell = mockShell();
        shell.run("alias ll='ls -l'");

        const result = shell.run("alias");

        expect(result).toBe("alias ll='ls -l'");
    });

    it("should reject an alias without a command", () => {
        const shell = mockShell();

        const result = shell.run("alias ll");

        expect(result).toBe("alias: invalid syntax. Use: alias name='command'");
    });

    it("should report an unexpected failure", () => {
        const state = EmulatorState.create({});
        vi.spyOn(state, "setEnvVariables").mockImplementation(() => {
            throw new Error("broken state");
        });

        const result = aliasCommand.functionDef(state, ["ll='ls", "-l'"]);

        expect(result).toEqual({ output: "broken state", type: "error" });
    });
});
