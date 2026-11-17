import { describe, expect, it } from "vitest";

import { mockShell } from "../../../helpers/terminal";

describe("cd", () => {
    it("should change the working directory", () => {
        const shell = mockShell();
        shell.run("cd home/projects");

        const result = shell.run("pwd");

        expect(result).toBe("/home/projects");
    });

    it("should go to the root with no argument", () => {
        const shell = mockShell();
        shell.run("cd home");
        shell.run("cd");

        const result = shell.run("pwd");

        expect(result).toBe("/");
    });

    it("should go back with a dash", () => {
        const shell = mockShell();
        shell.run("cd /home");
        shell.run("cd /empty");
        shell.run("cd -");

        const result = shell.run("pwd");

        expect(result).toBe("/home");
    });

    it("should fail on a missing directory", () => {
        const shell = mockShell();

        const result = shell.run("cd nowhere");

        expect(result).toBe("No Directory At Specified Location");
    });

    it("should fail on a file", () => {
        const shell = mockShell();

        const result = shell.run("cd /home/fruit.txt");

        expect(result).toBe("File At Specified Location");
    });

    it("should go to the root with a dash when there is no previous directory", () => {
        const shell = mockShell();
        shell.run("cd /home");
        shell.state.setEnvVariables({ cwd: "/home" });

        shell.run("cd -");

        expect(shell.run("pwd")).toBe("/");
    });
});
