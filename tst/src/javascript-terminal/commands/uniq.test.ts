import { describe, expect, it } from "vitest";

import { mockShell } from "../../../helpers/terminal";

describe("uniq", () => {
    it("should drop adjacent duplicates", () => {
        const shell = mockShell();

        const result = shell.run("uniq /home/fruit.txt");

        expect(result).toBe("banana\napple\ncherry");
    });

    it("should count duplicates", () => {
        const shell = mockShell();

        const result = shell.run("uniq -c /home/fruit.txt");

        expect(result).toBe("      1 banana\n      2 apple\n      1 cherry");
    });

    it("should need a file", () => {
        const shell = mockShell();

        const result = shell.run("uniq");

        expect(result).toBe("uniq: missing file operand");
    });

    it("should fail on a missing file", () => {
        const shell = mockShell();

        const result = shell.run("uniq /home/missing.txt");

        expect(result).toBe("Not A File At Specified Path: /home/missing.txt");
    });
});
