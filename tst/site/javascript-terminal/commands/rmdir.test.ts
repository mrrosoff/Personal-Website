import { describe, expect, it, vi } from "vitest";

import { mockFileSystem } from "../../../fixtures/fileSystem";
import { mockShell } from "../../../helpers/terminal";
import rmdirCommand from "../../../../site/javascript-terminal/commands/rmdir";
import EmulatorState from "../../../../site/javascript-terminal/emulatorState/EmulatorState";

describe("rmdir", () => {
    it("should remove a directory", () => {
        const shell = mockShell();
        shell.run("rmdir /empty");

        const result = shell.run("ls /");

        expect(result).toBe("home\nmedia");
    });

    it("should remove empty parents", () => {
        const shell = mockShell();
        shell.run("mkdir -p /a/b/c");
        shell.run("rmdir -p /a/b/c");

        const result = shell.run("ls /");

        expect(result).toBe("empty\nhome\nmedia");
    });

    it("should need a directory", () => {
        const shell = mockShell();

        const result = shell.run("rmdir");

        expect(result).toBe("usage: rmdir [-p] directory");
    });

    it("should keep a parent that is not empty", () => {
        const shell = mockShell();
        shell.run("mkdir -p /a/b/c");
        shell.run("mkdir /a/b/d");
        shell.run("rmdir -p /a/b/c");

        const result = shell.run("ls /a");

        expect(result).toBe("b");
    });

    it("should stop when it cannot read a parent", () => {
        const state = EmulatorState.create({ fs: mockFileSystem() });
        vi.spyOn(state, "getFileSystem")
            .mockReturnValueOnce(state.getFileSystem())
            .mockImplementation(() => {
                throw new Error("broken state");
            });

        const result = rmdirCommand.functionDef(state, ["-p", "/home/projects"]);

        expect(result).toEqual({ output: "" });
    });
});
