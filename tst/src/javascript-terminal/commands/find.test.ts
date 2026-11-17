import { describe, expect, it, vi } from "vitest";

import { mockShell } from "../../../helpers/terminal";
import findCommand from "../../../../src/javascript-terminal/commands/find";
import EmulatorState from "../../../../src/javascript-terminal/emulator-state/EmulatorState";

describe("find", () => {
    it("should list everything below a path", () => {
        const shell = mockShell();

        const result = shell.run("find /home/projects");

        expect(result).toBe("/home/projects/site.ts");
    });

    it("should filter by name", () => {
        const shell = mockShell();

        const result = shell.run("find / -name *.ts");

        expect(result).toBe("/home/projects/site.ts");
    });

    it("should accept a double dash name", () => {
        const shell = mockShell();

        const result = shell.run("find / --name *.mp3");

        expect(result).toBe("/media/song.mp3");
    });

    it("should search the working directory by default", () => {
        const shell = mockShell();
        shell.run("cd /home/projects");

        const result = shell.run("find");

        expect(result).toBe("/home/projects/site.ts");
    });

    it("should find nothing below a file", () => {
        const shell = mockShell();

        const result = shell.run("find /home/fruit.txt");

        expect(result).toBe("");
    });

    it("should report an unexpected failure", () => {
        const state = EmulatorState.create({});
        vi.spyOn(state, "getFileSystem").mockImplementation(() => {
            throw new Error("broken state");
        });

        const result = findCommand.functionDef(state, ["/"]);

        expect(result).toEqual({ output: "broken state", type: "error" });
    });
});
