import { describe, expect, it, vi } from "vitest";

import { mockShell } from "../../../helpers/terminal";
import printenvCommand from "../../../../src/javascript-terminal/commands/printenv";
import EmulatorState from "../../../../src/javascript-terminal/emulator-state/EmulatorState";

describe("printenv", () => {
    it("should print a variable", () => {
        const shell = mockShell({ NAME: "max" });

        const result = shell.run("printenv NAME");

        expect(result).toBe("max");
    });

    it("should print every variable", () => {
        const shell = mockShell();

        const result = shell.run("printenv");

        expect(result).toBe("cwd=/");
    });

    it("should print nothing for an unset variable", () => {
        const shell = mockShell();

        const result = shell.run("printenv NOPE");

        expect(result).toBe("");
    });

    it("should report an unexpected failure", () => {
        const state = EmulatorState.create({});
        vi.spyOn(state, "getEnvVariables").mockReturnValue(
            new Proxy(
                {},
                {
                    get: () => {
                        throw new Error("broken state");
                    }
                }
            )
        );

        const result = printenvCommand.functionDef(state, ["NAME"]);

        expect(result).toEqual({ output: "broken state", type: "error" });
    });
});
