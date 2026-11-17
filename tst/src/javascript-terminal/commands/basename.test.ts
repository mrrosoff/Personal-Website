import { describe, expect, it } from "vitest";

import { mockShell } from "../../../helpers/terminal";

describe("basename", () => {
    it("should return the last part of a path", () => {
        const shell = mockShell();

        const result = shell.run("basename /a/b/file.txt");

        expect(result).toBe("file.txt");
    });

    it("should drop a matching suffix", () => {
        const shell = mockShell();

        const result = shell.run("basename /a/b/file.txt .txt");

        expect(result).toBe("file");
    });

    it("should ignore a trailing slash", () => {
        const shell = mockShell();

        const result = shell.run("basename /a/b/");

        expect(result).toBe("b");
    });

    it("should need a path", () => {
        const shell = mockShell();

        const result = shell.run("basename");

        expect(result).toBe("basename: missing operand");
    });

    it("should keep a suffix that does not match", () => {
        const shell = mockShell();

        const result = shell.run("basename /a/file.txt .md");

        expect(result).toBe("file.txt");
    });

    it("should return a bare name as is", () => {
        const shell = mockShell();

        const result = shell.run("basename file.txt");

        expect(result).toBe("file.txt");
    });
});
