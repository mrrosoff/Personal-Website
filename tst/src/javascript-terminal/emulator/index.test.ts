import { describe, expect, it } from "vitest";

import { mockShell } from "../../../helpers/terminal";

describe("execute", () => {
    it("should report an unknown command", () => {
        const shell = mockShell();

        const result = shell.run("nope");

        expect(result).toBe("Command Not Found");
    });

    it("should run chained commands", () => {
        const shell = mockShell();

        const result = shell.run("echo a && echo b; echo c");

        expect(result).toBe("a\nb\nc");
    });

    it("should record history", () => {
        const shell = mockShell();

        shell.run("pwd");
        shell.run("echo hi");

        expect(shell.state.getHistory()).toEqual(["pwd", "echo hi"]);
    });

    it("should print nothing for a blank line", () => {
        const shell = mockShell();

        const result = shell.run("   ");

        expect(result).toBe("");
    });

    it("should catch a command that crashes", () => {
        const shell = mockShell();
        shell.state.setCommandMapping({
            boom: {
                optDef: {},
                functionDef: () => {
                    throw new Error("boom");
                }
            }
        });

        const result = shell.run("boom");

        expect(result).toBe("boom");
    });
});

describe("autocomplete", () => {
    it("should complete a command name", () => {
        const shell = mockShell();

        const result = shell.emulator.autocomplete(shell.state, "whoa");

        expect(result).toBe("whoami");
    });

    it("should complete a file name", () => {
        const shell = mockShell();

        const result = shell.emulator.autocomplete(shell.state, "cat home/fru");

        expect(result).toBe("cat home/fruit.txt");
    });

    it("should complete an option", () => {
        const shell = mockShell();

        const result = shell.emulator.autocomplete(shell.state, "ls --lo");

        expect(result).toBe("ls --long");
    });

    it("should leave a finished path alone", () => {
        const shell = mockShell();

        const result = shell.emulator.autocomplete(shell.state, "cat home/fruit.txt");

        expect(result).toBe("cat home/fruit.txt");
    });

    it("should list the choices on the second tab", () => {
        const shell = mockShell();
        shell.emulator.autocomplete(shell.state, "cat home/p");

        shell.emulator.autocomplete(shell.state, "cat home/p");

        expect(shell.state.getOutputs().at(-1)?.output[0].output).toBe(
            "home/people.csv home/projects"
        );
    });

    it("should keep the working directory for a command that lists its output", () => {
        const shell = mockShell();
        shell.state.setCommandMapping({
            go: {
                optDef: {},
                functionDef: () => ({
                    output: ["a", "b"] as never,
                    type: "cwd",
                    oldCwdPath: "/home"
                })
            },
            stay: { optDef: {}, functionDef: () => ({ output: ["a"] as never, type: "cwd" }) }
        });

        shell.run("go");
        shell.run("stay");

        expect(shell.state.getOutputs().map(({ cwd }) => cwd)).toEqual(["/home", "/"]);
    });

    it("should leave text alone with nothing to suggest", () => {
        const shell = mockShell();

        const result = shell.emulator.autocomplete(shell.state, "zzz");

        expect(result).toBe("zzz");
    });

    it("should suggest everything after a space", () => {
        const shell = mockShell();
        shell.run("cd /home/projects");

        const result = shell.emulator.autocomplete(shell.state, "pwd ");

        expect(result).toBe("pwd site.ts");
    });
});
