import { describe, expect, it, vi } from "vitest";

import { mockShell } from "../../../helpers/terminal";
import echoCommand from "../../../../src/javascript-terminal/commands/echo";
import EmulatorState from "../../../../src/javascript-terminal/emulator-state/EmulatorState";

describe("echo", () => {
    it("should print its arguments", () => {
        const shell = mockShell();

        const result = shell.run("echo hello world");

        expect(result).toBe("hello world");
    });

    it("should expand variables", () => {
        const shell = mockShell({ NAME: "max" });

        const result = shell.run("echo hi $NAME");

        expect(result).toBe("hi max");
    });

    it("should strip surrounding quotes", () => {
        const shell = mockShell();

        const result = shell.run('echo "quoted"');

        expect(result).toBe("quoted");
    });

    it("should print nothing for an unset variable", () => {
        const shell = mockShell();

        const result = shell.run("echo $NOPE");

        expect(result).toBe("");
    });

    it("should report an unexpected failure", () => {
        const state = EmulatorState.create({});
        vi.spyOn(state, "getEnvVariables").mockImplementation(() => {
            throw new Error("broken state");
        });

        const result = echoCommand.functionDef(state, ["hi"]);

        expect(result).toEqual({ output: "broken state", type: "error" });
    });
});
