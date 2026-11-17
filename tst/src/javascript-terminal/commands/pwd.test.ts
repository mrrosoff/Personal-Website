import { describe, expect, it, vi } from "vitest";

import { mockShell } from "../../../helpers/terminal";
import pwdCommand from "../../../../src/javascript-terminal/commands/pwd";
import EmulatorState from "../../../../src/javascript-terminal/emulator-state/EmulatorState";

describe("pwd", () => {
    it("should start at the root", () => {
        const shell = mockShell();

        const result = shell.run("pwd");

        expect(result).toBe("/");
    });

    it("should report an unexpected failure", () => {
        const state = EmulatorState.create({});
        vi.spyOn(state, "getEnvVariables").mockImplementation(() => {
            throw new Error("broken state");
        });

        const result = pwdCommand.functionDef(state, []);

        expect(result).toEqual({ output: "broken state", type: "error" });
    });
});
