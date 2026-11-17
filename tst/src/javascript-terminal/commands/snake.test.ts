import { describe, expect, it, vi } from "vitest";

import { mockShell } from "../../../helpers/terminal";
import snakeCommand from "../../../../src/javascript-terminal/commands/snake";
import EmulatorState from "../../../../src/javascript-terminal/emulator-state/EmulatorState";

describe("snake", () => {
    it("should take over the terminal", () => {
        const shell = mockShell();

        shell.run("snake");

        expect(shell.state.getBlockingMode()).toEqual({});
    });

    it("should report an unexpected failure", () => {
        const state = EmulatorState.create({});
        vi.spyOn(state, "setBlockingMode").mockImplementation(() => {
            throw new Error("broken state");
        });

        const result = snakeCommand.functionDef(state, []);

        expect(result).toEqual({ output: "broken state", type: "error" });
    });
});
