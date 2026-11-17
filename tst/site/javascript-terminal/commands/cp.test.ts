import { describe, expect, it } from "vitest";

import { mockShell } from "../../../helpers/terminal";

describe("cp", () => {
    it("should copy a file", () => {
        const shell = mockShell();
        shell.run("cp /home/fruit.txt /home/copy.txt");

        const result = shell.run("cat /home/copy.txt");

        expect(result).toBe("banana\napple\napple\ncherry");
    });

    it("should keep the original", () => {
        const shell = mockShell();
        shell.run("cp /home/fruit.txt /home/copy.txt");

        const result = shell.run("cat /home/fruit.txt");

        expect(result).toBe("banana\napple\napple\ncherry");
    });

    it("should say what it copied when verbose", () => {
        const shell = mockShell();

        const result = shell.run("cp -v /home/fruit.txt /home/copy.txt");

        expect(result).toBe("'/home/fruit.txt' -> '/home/copy.txt'");
    });

    it("should refuse to copy onto itself", () => {
        const shell = mockShell();

        const result = shell.run("cp /home/fruit.txt /home/fruit.txt");

        expect(result).toBe("Source and destination are the same (not copied).");
    });

    it("should need a source and destination", () => {
        const shell = mockShell();

        const result = shell.run("cp /home/fruit.txt");

        expect(result).toBe("usage: cp [-rv] source dest");
    });

    it("should copy a directory with -r", () => {
        const shell = mockShell();
        shell.run("cp -r /home/projects /home/backup");

        const result = shell.run("ls /home/backup");

        expect(result).toBe("site.ts");
    });

    it("should fail on a missing source", () => {
        const shell = mockShell();

        const result = shell.run("cp /home/missing.txt /home/copy.txt");

        expect(result).toBe("Not A File At Specified Path: /home/missing.txt");
    });
});
