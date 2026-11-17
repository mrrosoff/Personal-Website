import { describe, expect, it, vi } from "vitest";

import { mockShell } from "../../../helpers/terminal";
import whichCommand from "../../../../src/javascript-terminal/commands/which";
import EmulatorState from "../../../../src/javascript-terminal/emulator-state/EmulatorState";

describe("which", () => {
    it("should find a command", () => {
        const shell = mockShell();

        const result = shell.run("which ls");

        expect(result).toBe("/bin/ls");
    });

    it("should miss an unknown command", () => {
        const shell = mockShell();

        const result = shell.run("which nope");

        expect(result).toBe("nope: command not found");
    });

    it("should need a command", () => {
        const shell = mockShell();

        const result = shell.run("which");

        expect(result).toBe("which: missing command operand");
    });

    it("should report an unexpected failure", () => {
        const state = EmulatorState.create({});
        vi.spyOn(state, "getCommandMapping").mockImplementation(() => {
            throw new Error("broken state");
        });

        const result = whichCommand.functionDef(state, ["ls"]);

        expect(result).toEqual({ output: "broken state", type: "error" });
    });
});
