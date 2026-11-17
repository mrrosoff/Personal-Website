import { describe, expect, it, vi } from "vitest";

import { mockShell } from "../../../helpers/terminal";
import historyCommand from "../../../../src/javascript-terminal/commands/history";
import EmulatorState from "../../../../src/javascript-terminal/emulator-state/EmulatorState";

describe("history", () => {
    it("should list past commands", () => {
        const shell = mockShell();
        shell.run("pwd");

        const result = shell.run("history");

        expect(result).toBe("pwd\nhistory");
    });

    it("should report an unexpected failure", () => {
        const state = EmulatorState.create({});
        vi.spyOn(state, "getHistory").mockImplementation(() => {
            throw new Error("broken state");
        });

        const result = historyCommand.functionDef(state, []);

        expect(result).toEqual({ output: "broken state", type: "error" });
    });
});
