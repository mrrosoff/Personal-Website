import { describe, expect, it } from "vitest";

import { mockShell } from "../../../setup";

describe("grep", () => {
    it("should find matching lines", () => {
        const shell = mockShell();

        const result = shell.run("grep app /home/fruit.txt");

        expect(result).toBe("apple\napple");
    });

    it("should ignore case", () => {
        const shell = mockShell();

        const result = shell.run("grep -i CHERRY /home/fruit.txt");

        expect(result).toBe("cherry");
    });

    it("should number matching lines", () => {
        const shell = mockShell();

        const result = shell.run("grep -n cherry /home/fruit.txt");

        expect(result).toBe("4:cherry");
    });

    it("should invert the match", () => {
        const shell = mockShell();

        const result = shell.run("grep -v a /home/fruit.txt");

        expect(result).toBe("cherry");
    });

    it("should refuse a directory", () => {
        const shell = mockShell();

        const result = shell.run("grep a home");

        expect(result).toBe("grep: home: Is a directory");
    });

    it("should need a pattern", () => {
        const shell = mockShell();

        const result = shell.run("grep");

        expect(result).toBe("grep: missing pattern");
    });

    it("should need a file", () => {
        const shell = mockShell();

        const result = shell.run("grep app");

        expect(result).toBe("grep: missing file operand");
    });
});
