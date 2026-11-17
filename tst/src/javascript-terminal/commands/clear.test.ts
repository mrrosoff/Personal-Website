import { describe, expect, it, vi } from "vitest";

import { mockShell } from "../../../helpers/terminal";
import clearCommand from "../../../../src/javascript-terminal/commands/clear";
import EmulatorState from "../../../../src/javascript-terminal/emulator-state/EmulatorState";

describe("clear", () => {
    it("should wipe the screen", () => {
        const shell = mockShell();
        shell.run("pwd");

        shell.run("clear");

        expect(shell.state.getOutputs()).toBeEmpty();
    });

    it("should report an unexpected failure", () => {
        const state = EmulatorState.create({});
        vi.spyOn(state, "setOutputs").mockImplementation(() => {
            throw new Error("broken state");
        });

        const result = clearCommand.functionDef(state, []);

        expect(result).toEqual({ output: "broken state", type: "error" });
    });
});
